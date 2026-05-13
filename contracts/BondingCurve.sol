// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IdeaToken} from "./IdeaToken.sol";

/// @title BondingCurve
/// @notice Pump.fun-style constant-product bonding curve using virtual + real reserves.
///         Each curve owns 100% of an IdeaToken's supply. Trades happen against the
///         curve until `MIGRATION_THRESHOLD` ETH is raised, at which point the curve
///         is locked from further buys/sells and a migrator can move liquidity to a
///         Uniswap-style pool on Base Sepolia.
///
///         Math:
///           k = VIRTUAL_ETH * VIRTUAL_TOKEN
///           ethReserve  = VIRTUAL_ETH   + ethRaised
///           tokenReserve= k / ethReserve
///           tokensOut(ethIn) = tokenReserve - k / (ethReserve + ethIn)
///           ethOut(tokensIn) = ethReserve - k / (tokenReserve + tokensIn)
contract BondingCurve {
    // ---------------- Curve constants ----------------
    uint256 public constant VIRTUAL_ETH   = 1.6 ether;
    uint256 public constant VIRTUAL_TOKEN = 800_000_000 ether; // 800M * 1e18
    uint256 public constant REAL_TOKEN    = 800_000_000 ether; // total supply
    // TESTNET: 0.001 ETH threshold for easy testing on Base Sepolia
    // Production: Change to 16 ether for mainnet
    uint256 public constant MIGRATION_THRESHOLD = 0.001 ether; // 1000x smaller for testnet
    uint256 public constant FEE_BPS = 100;       // 1%
    uint256 public constant BPS = 10_000;

    // ---------------- State ----------------
    IdeaToken public immutable token;
    address  public immutable creator;
    address  public immutable factory;
    address  public immutable feeRecipient;

    uint256 public ethRaised;        // real ETH collected (excludes fees)
    uint256 public tokensSold;       // tokens distributed to traders
    bool    public migrated;

    // ---------------- Events ----------------
    event Buy(address indexed buyer, uint256 ethIn, uint256 fee, uint256 tokensOut, uint256 ethRaised, uint256 tokensSold);
    event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee, uint256 ethRaised, uint256 tokensSold);
    event Migrated(address indexed by, uint256 ethLiquidity, uint256 tokenLiquidity);

    modifier notMigrated() {
        require(!migrated, "Curve: migrated");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _creator,
        address _feeRecipient
    ) {
        factory = msg.sender;
        creator = _creator;
        feeRecipient = _feeRecipient;
        token = new IdeaToken(_name, _symbol, REAL_TOKEN, address(this));
    }

    // ---------------- Quotes ----------------

    function k() public pure returns (uint256) {
        return VIRTUAL_ETH * VIRTUAL_TOKEN;
    }

    function reserves() public view returns (uint256 ethReserve, uint256 tokenReserve) {
        ethReserve = VIRTUAL_ETH + ethRaised;
        tokenReserve = k() / ethReserve;
    }

    /// @notice Spot price in wei per 1e18 token.
    function priceWei() external view returns (uint256) {
        (uint256 e, uint256 t) = reserves();
        return (e * 1e18) / t;
    }

    /// @notice Quote tokens received for `ethIn` (after 1% fee).
    function quoteBuy(uint256 ethIn) public view returns (uint256 tokensOut, uint256 fee) {
        fee = (ethIn * FEE_BPS) / BPS;
        uint256 net = ethIn - fee;
        (uint256 e, uint256 t) = reserves();
        uint256 newE = e + net;
        uint256 newT = k() / newE;
        tokensOut = t - newT;
    }

    /// @notice Quote ETH returned for `tokensIn` (after 1% fee).
    function quoteSell(uint256 tokensIn) public view returns (uint256 ethOut, uint256 fee) {
        (uint256 e, uint256 t) = reserves();
        uint256 newT = t + tokensIn;
        uint256 newE = k() / newT;
        uint256 gross = e - newE;
        fee = (gross * FEE_BPS) / BPS;
        ethOut = gross - fee;
    }

    // ---------------- Trading ----------------

    function buy(uint256 minTokensOut) external payable notMigrated returns (uint256 tokensOut) {
        require(msg.value > 0, "Curve: no ETH");
        uint256 fee;
        (tokensOut, fee) = quoteBuy(msg.value);
        require(tokensOut >= minTokensOut, "Curve: slippage");
        require(tokensSold + tokensOut <= REAL_TOKEN, "Curve: cap");

        ethRaised += (msg.value - fee);
        tokensSold += tokensOut;

        if (fee > 0) {
            (bool ok, ) = feeRecipient.call{value: fee}("");
            require(ok, "Curve: fee xfer");
        }

        require(token.transfer(msg.sender, tokensOut), "Curve: token xfer");

        emit Buy(msg.sender, msg.value, fee, tokensOut, ethRaised, tokensSold);

        if (ethRaised >= MIGRATION_THRESHOLD) {
            migrated = true;
        }
    }

    function sell(uint256 tokensIn, uint256 minEthOut) external notMigrated returns (uint256 ethOut) {
        require(tokensIn > 0, "Curve: no tokens");
        uint256 fee;
        (ethOut, fee) = quoteSell(tokensIn);
        require(ethOut >= minEthOut, "Curve: slippage");
        require(ethRaised >= ethOut + fee, "Curve: insufficient eth");

        require(token.transferFrom(msg.sender, address(this), tokensIn), "Curve: pull");
        ethRaised -= (ethOut + fee);
        tokensSold -= tokensIn;

        if (fee > 0) {
            (bool ok1, ) = feeRecipient.call{value: fee}("");
            require(ok1, "Curve: fee xfer");
        }
        (bool ok2, ) = msg.sender.call{value: ethOut}("");
        require(ok2, "Curve: eth xfer");

        emit Sell(msg.sender, tokensIn, ethOut, fee, ethRaised, tokensSold);
    }

    /// @notice After migration threshold is hit, factory's owner can pull liquidity
    ///         to seed a Uniswap V2 / V3 pool. Kept simple for testnet.
    function migrate(address to) external {
        require(migrated, "Curve: not migrated");
        require(msg.sender == feeRecipient, "Curve: not authorised");
        uint256 ethBal = address(this).balance;
        uint256 tokenBal = token.balanceOf(address(this));
        if (ethBal > 0) {
            (bool ok, ) = to.call{value: ethBal}("");
            require(ok, "Curve: eth pull");
        }
        if (tokenBal > 0) {
            require(token.transfer(to, tokenBal), "Curve: token pull");
        }
        emit Migrated(to, ethBal, tokenBal);
    }

    receive() external payable {}
}
