// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Helpers.sol";
import "../utils/Errors.sol";

abstract contract Helpers {
    modifier positiveAddress(address addr) {
        if (address(0) == addr) {
            revert ZeroAddress();
        }
        _;
    }

    modifier nonEmptyString(string memory str) {
        if (bytes(str).length == 0) {
            revert EmptyString();
        }
        _;
    }

    modifier nonEmptyBytes(bytes memory bte) {
        if (bte.length == 0) {
            revert EmptyBytes();
        }
        _;
    }

    modifier nonZero(uint256 num) {
        if (num == 0) {
            revert ZeroNumber();
        }
        _;
    }
}
