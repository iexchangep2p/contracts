// contracts/test/MockFacet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockFacet {
    uint256 private number;

    function getNumber() external view returns (uint256) {
        return number;
    }

    function setNumber(uint256 _number) external {
        number = _number;
    }
}
