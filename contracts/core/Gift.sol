// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../interface/IOwnerManager.sol";
import "../interface/IWhiteList.sol";
import "../interface/IStoreList.sol";

contract Gift is ERC20, ERC2771Context {
    IOwnerManager public ownerManager;
    IWhiteList public whiteList;
    IStoreList public storeList;

    mapping (address => uint256) public expiryDate;

    event CashOut(uint256 storeId, uint256 value);

    modifier onlyOwner {
        require(_msgSender() == ownerManager.owner(), "caller is not the owner");
        _;
    }

    modifier onlyWhiteList {
        require(whiteList.whiteList(_msgSender()), "address is not whiteList");
        _;
    }

    constructor(
        address forwarder, 
        address _ownerManager,
        address _storeList,
        address _whiteList
    ) ERC20("EodigoToken", "EDG") ERC2771Context(forwarder) {
        ownerManager = IOwnerManager(_ownerManager);
        whiteList = IWhiteList(_whiteList);
        storeList = IStoreList(_storeList);
    }

    // 만료되었는지 확인, 만약 만료되었을 경우에는 소각
    function cashExpiredCheck(address _address) public onlyOwner {
        if (block.timestamp > expiryDate[_address]) _burn(_address, balanceOf(_address));
    }

    // 발급
    function mint(address to, uint256 value) onlyOwner public {
        _mint(to, value);
        
        expiryDate[to] = block.timestamp + 180 days; // 6개월
    }

    // 결제
    function transfer(
        address to,
        uint256 value
    ) public onlyWhiteList override returns(bool) {
        expiryDate[_msgSender()] = block.timestamp + 180 days; // 6개월

        // Store 유효성 검사
        uint256 storeId = storeList.storeIdByAddress(to);
        IStoreList.Store memory store = storeList.storeList(storeId);
        require(store.wallet != address(0) && store.status, "Incorrect Store Address");

        return super.transfer(store.wallet, value);
    }

    // 정산
    function settlement(uint256 value) public  {
        // Store 유효성 검사
        uint256 storeId = storeList.storeIdByAddress(_msgSender());
        IStoreList.Store memory store = storeList.storeList(storeId);
        require(store.wallet != address(0) && store.status, "Incorrect Store Address");
        require(!(balanceOf(_msgSender()) < value), "Balance Too Low");

        // 정산량 만큼 소각
        _burn(store.wallet, value);

        // 기록
        emit CashOut(store.id, value);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
