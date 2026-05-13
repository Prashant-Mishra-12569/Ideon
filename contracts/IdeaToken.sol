// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IdeaToken
/// @notice Minimal fixed-supply ERC-20 minted entirely to its BondingCurve.
///         Decimals are 18. No further mint after deployment.
contract IdeaToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _supply, address _to) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[_to] = _supply;
        emit Transfer(address(0), _to, _supply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        require(a >= value, "ERC20: insufficient allowance");
        if (a != type(uint256).max) {
            allowance[from][msg.sender] = a - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "ERC20: zero address");
        uint256 b = balanceOf[from];
        require(b >= value, "ERC20: insufficient balance");
        unchecked {
            balanceOf[from] = b - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }
}
