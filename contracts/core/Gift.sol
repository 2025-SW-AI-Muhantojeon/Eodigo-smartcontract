// // SPDX-License-Identifier: Apache-2.0
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract GiftContract is ERC20 {
//     constructor(address _whiteList) ERC20("EodigoToken", "EDG") {
//         whiteList = IWhiteList(_whiteList);
//     }

//     function mint(uint256 value) public {
//         _mint(msg.sender, value);
//     }

//     function transfer(address to, uint256 value) public override returns(bool) {
//         require(store[to], "Transfers allowed only to stores");
//         return super.transfer(to, value);
//     }

//     function decimals() public pure override returns (uint8) {
//         return 2;
//     }
// }