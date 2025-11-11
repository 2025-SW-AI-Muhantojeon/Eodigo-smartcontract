// // SPDX-License-Identifier: Apache-2.0
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "../interface/IOwnerManager.sol";
// import "../interface/IStoreList.sol";
// import "../interface/IWhiteList.sol";

// // @TODO
// // 정산 기능, 6개월 미사용시 자산 초기화

// contract GiftContract is ERC20 {
//     IOwnerManager public ownerManager;
//     IWhiteList public whiteList;
//     IStoreList public storeList;

//     mapping (address => uint256) expriyDate;
//     mapping (address => uint256) cashOutValue;

//     event CashOut(address storeAddress, uint256 value);

//     modifier onlyOwner {
//         require(msg.sender == ownerManager.owner(), "caller is not the owner");
//         _;
//     }

//     modifier onlyWhiteList(address _address) {
//         require(whiteList.whiteList(_address), "address is not whiteList");
//         _;
//     }

//     modifier onlyStore(address _address) {
//         require(storeList.storeList(_address), "address is not store");
//         _;
//     }

//     constructor(address _ownerManager, address _storeList, address _whiteList) ERC20("EodigoToken", "EDG") {
//         ownerManager = IOwnerManager(_ownerManager);
//         storeList = IStoreList(_storeList);
//         whiteList = IWhiteList(_whiteList);
//     }

//     function mint(uint256 value) onlyOwner public {
//         _mint(msg.sender, value);
//     }

//     function transfer(
//         address to,
//         uint256 value
//     ) public onlyWhiteList(msg.sender) onlyStore(to) override returns (bool) {
//         return super.transfer(to, value);
//     }


//     function decimals() public pure override returns (uint8) {
//         return 0;
//     }
// }
