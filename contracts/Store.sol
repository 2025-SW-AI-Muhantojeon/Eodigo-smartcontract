// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./interface/IOwnerManager.sol";

contract StoreList {
    IOwnerManager public ownerManager;

    mapping (uint256 => bool) public storeList;
    uint256[] public storeListArray;

    error IncorrectStoreId(uint256 storeId);
    
    event StoreListUpdated(uint256 indexed storeId, bool status);

    modifier onlyOwner {
        require(msg.sender == ownerManager.owner(), "caller is not the owner");
        _;
    }

    constructor(address _ownerManager) {
        ownerManager = IOwnerManager(_ownerManager);
    }

    function setStoreList(uint256 storeId, bool status) public onlyOwner {
        storeList[storeId] = status;

        if (status) storeListArray.push(storeId);
        else {
            bool isFind;
            for (uint256 i = 0; i < storeListArray.length; i++) {
                if (storeListArray[i] == storeId) { 
                    delete storeListArray[i];
                    isFind = true;
                    break;
                }
            }

            if (!isFind) revert IncorrectStoreId(storeId);
        }

        emit StoreListUpdated(storeId, status);
    }
}