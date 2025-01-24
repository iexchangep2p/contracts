// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IAppeal {
    enum AppealDecision {
        unvoted,
        release,
        cancel
    }

    struct Appeal {
        uint256 orderId;
        address appealer;
        bytes32 reasonHash;
        AppealDecision appealDecision;
        uint256 createdAt;
    }
}
