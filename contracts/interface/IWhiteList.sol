// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

interface IWhiteList {
    function whiteList(address wallet) external view returns (bool);
}
