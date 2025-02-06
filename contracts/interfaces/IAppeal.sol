// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../globals/Types.sol";
abstract contract IAppeal {
    enum AppealDecision {
        unvoted,
        release,
        cancel
    }
    struct Appeal {
        bytes32 orderHash;
        address appealer;
        AppealDecision appealDecision;
        uint256 createdAt;
    }
    event OrderAppealed(
        bytes32 orderHash,
        address appealer,
        AppealDecision appealDecision,
        OrderState orderState,
        uint256 createdAt
    );
    error OrderAlreadyAppealed();

    function appealOrder(
        bytes32 _orderHash,
        bytes calldata _sig
    ) external virtual;

    function settleAppeal(
        bytes32 _orderHash,
        AppealDecision _appealDecision
    ) external virtual;
}
