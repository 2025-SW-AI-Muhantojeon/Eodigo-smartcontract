// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

interface IStoreList {
    struct Store {
        uint256 id;
        address wallet;
        bool status;
    }

    function storeList(uint256 storeId) external view returns (Store memory);
    function storeIdByAddress(address _address) external view returns (uint256);
    
}
