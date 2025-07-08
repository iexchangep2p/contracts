// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IOrderSig.sol";
import "../globals/Errors.sol";
import "../libraries/Helpers.sol";

abstract contract OrderHelpers {
    modifier validSig(bytes calldata _sig) {
        if (HelpersLib.compareBytes(_sig, HelpersLib.emptyBytes)) {
            revert InvalidSignature();
        }
        _;
    }

    modifier sigNotExpired(uint256 _expiry) {
        if (_expiry < block.timestamp) {
            revert SignatureExpired();
        }
        _;
    }

    modifier onlyOrderMethod(
        IOrderSig.OrderMethod _method,
        IOrderSig.OrderMethod _expected
    ) {
        if (_method != _expected) {
            revert IOrderSig.InvalidOrderMethodCall();
        }
        _;
    }
}
