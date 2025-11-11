// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./interface/IOwnerManager.sol";

contract StoreList {
    IOwnerManager public ownerManager;

    struct Store {
        uint256 storeId;
        address wallet;
        bool status;
    }

    mapping (uint256 => Store) public storeList;

    error IncorrectStoreId(uint256 storeId);
    error IncorrectAddress(address wallet);

    event StoreWalletUpdated(uint256 indexed storeId, address indexed newWallet);
    event StoreStatusUpdated(uint256 indexed storeId, bool status);
    event NewStore(uint256 indexed storeId, Store store);

    modifier onlyOwner {
        require(msg.sender == ownerManager.owner(), "caller is not the owner");
        _;
    }

    constructor(address _ownerManager) {
        ownerManager = IOwnerManager(_ownerManager);
    }

    function addStore(uint256 storeId, address wallet) external onlyOwner {
        Store storage store = storeList[storeId];
        require(store.wallet == address(0), "already exist store");
        if (wallet == address(0)) revert IncorrectAddress(wallet);

        storeList[storeId].storeId = storeId;
        storeList[storeId].wallet = wallet;
        storeList[storeId].status = true;

        emit NewStore(storeId, store);
    }

    function updateStoreWallet(uint256 storeId, address newWallet) external onlyOwner {
        Store storage store = storeList[storeId];
        if (store.wallet == address(0)) revert IncorrectStoreId(storeId);
        if (newWallet == address(0)) revert IncorrectAddress(newWallet);

        store.wallet = newWallet;

        emit StoreWalletUpdated(storeId, newWallet);
    }

    function updateStoreStatus(uint256 storeId, bool status) external onlyOwner { 
        Store storage store = storeList[storeId];
        if (store.wallet == address(0)) revert IncorrectStoreId(storeId);

        store.status = status;

        emit StoreStatusUpdated(storeId, status);
    }
}