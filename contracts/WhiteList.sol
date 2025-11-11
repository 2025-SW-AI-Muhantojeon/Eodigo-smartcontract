// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./interface/IOwnerManager.sol";

contract WhiteList {
    IOwnerManager public ownerManager;

    mapping (address => bool) public whiteList;

    event WhiteListUpdated(address indexed _address, bool status);
 
    modifier onlyOwner {
        require(msg.sender == ownerManager.owner(), "caller is not the owner");
        _;
    }

    constructor(address _ownerManager) {
        ownerManager = IOwnerManager(_ownerManager);
    }

    function setWhiteList(address _address, bool status) external onlyOwner {
        whiteList[_address] = status;
        emit WhiteListUpdated(_address, status);
    }
} 