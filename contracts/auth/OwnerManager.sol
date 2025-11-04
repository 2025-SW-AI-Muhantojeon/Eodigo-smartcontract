// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnerManager is Ownable {
    constructor() Ownable(msg.sender) {}
}