// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./interface/IOwnerManager.sol";

contract WhiteList {
    IOwnerManager public ownerManager;

    mapping (address => bool) public whiteList;
    address[] public whiteListArray;

    error IncorrectAddress(address _address);

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
        
        if (status) whiteListArray.push(_address);
        else {
            bool isFind;
            for (uint256 i = 0; i < whiteListArray.length; i++) {
                if (whiteListArray[i] == _address) {
                    delete whiteListArray[i];
                    isFind = true;
                    break;
                }

                if (!isFind) revert IncorrectAddress(_address);
            }
        }

        emit WhiteListUpdated(_address, status);
    }
} 