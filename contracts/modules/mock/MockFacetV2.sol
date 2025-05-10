// contracts/test/MockFacet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockFacetV2 {
    uint256 private number;

    function getNumber() external pure returns (uint256) {
        return 42;
    }

    function setNumber(uint256 _number) external {
        number = _number;
    }

    function supportsInterface(
        bytes4 _interfaceId
    ) external pure returns (bytes4) {
        return _interfaceId; 
    }
}
