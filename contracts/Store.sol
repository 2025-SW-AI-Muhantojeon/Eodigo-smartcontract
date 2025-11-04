// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./interface/IOwnerManager.sol";

contract StoreList {
    IOwnerManager public ownerManager;

    constructor(address _ownerManager) {
        ownerManager = IOwnerManager(_ownerManager);
    }

    modifier onlyOwner {
        require(msg.sender == ownerManager.owner());
        _;
    }

    mapping (address => bool) public storeList;
}