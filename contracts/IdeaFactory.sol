// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BondingCurve} from "./BondingCurve.sol";
import {IdeaToken} from "./IdeaToken.sol";

/// @title IdeaFactory
/// @notice Deploys a new BondingCurve (and its IdeaToken) per startup idea.
///         All idea metadata (logo, description, socials) lives on IPFS — only
///         the CID is stored on-chain to keep gas low.
contract IdeaFactory {
    struct Idea {
        address curve;
        address token;
        address creator;
        string  name;
        string  symbol;
        string  metadataCID; // ipfs CID (without ipfs:// prefix)
        uint64  createdAt;
    }

    address public owner;
    address public feeRecipient;
    uint256 public creationFee; // wei required to launch
    Idea[]  public ideas;

    mapping(address => uint256) public indexOf; // curve => ideas index + 1 (0 = none)

    event IdeaCreated(
        uint256 indexed id,
        address indexed creator,
        address curve,
        address token,
        string name,
        string symbol,
        string metadataCID
    );
    event FeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);
    event OwnerUpdated(address newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Factory: !owner");
        _;
    }

    constructor(address _feeRecipient, uint256 _creationFee) {
        owner = msg.sender;
        feeRecipient = _feeRecipient == address(0) ? msg.sender : _feeRecipient;
        creationFee = _creationFee;
    }

    function ideasCount() external view returns (uint256) {
        return ideas.length;
    }

    function getAllIdeas() external view returns (Idea[] memory) {
        return ideas;
    }

    function getIdea(uint256 id) external view returns (Idea memory) {
        return ideas[id];
    }

    function createIdea(
        string calldata name_,
        string calldata symbol_,
        string calldata metadataCID
    ) external payable returns (uint256 id, address curve, address token) {
        require(msg.value >= creationFee, "Factory: fee");
        require(bytes(name_).length > 0 && bytes(name_).length <= 64, "Factory: name");
        require(bytes(symbol_).length > 0 && bytes(symbol_).length <= 10, "Factory: symbol");
        require(bytes(metadataCID).length > 0 && bytes(metadataCID).length <= 96, "Factory: cid");

        BondingCurve c = new BondingCurve(name_, symbol_, msg.sender, feeRecipient);
        curve = address(c);
        token = address(c.token());

        id = ideas.length;
        ideas.push(Idea({
            curve: curve,
            token: token,
            creator: msg.sender,
            name: name_,
            symbol: symbol_,
            metadataCID: metadataCID,
            createdAt: uint64(block.timestamp)
        }));
        indexOf[curve] = id + 1;

        if (msg.value > 0) {
            (bool ok, ) = feeRecipient.call{value: msg.value}("");
            require(ok, "Factory: fee xfer");
        }

        emit IdeaCreated(id, msg.sender, curve, token, name_, symbol_, metadataCID);
    }

    // ---------------- Admin ----------------
    function setCreationFee(uint256 v) external onlyOwner { creationFee = v; emit FeeUpdated(v); }
    function setFeeRecipient(address v) external onlyOwner {
        require(v != address(0), "Factory: zero");
        feeRecipient = v; emit FeeRecipientUpdated(v);
    }
    function transferOwnership(address v) external onlyOwner {
        require(v != address(0), "Factory: zero");
        owner = v; emit OwnerUpdated(v);
    }
}
