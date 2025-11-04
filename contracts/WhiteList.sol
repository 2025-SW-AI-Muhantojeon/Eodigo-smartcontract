// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./interface/IOwnerManager.sol";

contract WhiteList {
    IOwnerManager public ownerManager;

    constructor(address _ownerManager) {
        ownerManager = IOwnerManager(_ownerManager);
    }
 
    modifier onlyOwner {
        require(msg.sender == ownerManager.owner());
        _;
    }

    mapping (address => bool) public whiteList;

    function setWhiteList(address user, bool status) external onlyOwner returns(bool) {
        return whiteList[user] = status;
    }
} 