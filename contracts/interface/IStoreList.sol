// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

interface IStoreList {
    function storeList(uint256 storeId) external view returns (bool);
}
