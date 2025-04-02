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
        uint256 cancelledAt;
        address settler;
        uint256 settledAt;
    }
    event OrderAppealed(
        bytes32 orderHash,
        address appealer,
        AppealDecision appealDecision,
        OrderState orderState,
        uint256 createdAt
    );
    event AppealCancelled(
        bytes32 orderHash,
        address appealer,
        AppealDecision appealDecision,
        OrderState orderState,
        uint256 cancelledAt
    );
    event AppealSettled(
        bytes32 orderHash,
        address appealer,
        address settler,
        AppealDecision appealDecision,
        OrderState orderState,
        uint256 settledAt
    );
    error OrderAlreadyAppealed();

    function appealOrder(bytes32 _orderHash) external virtual;

    function cancelAppeal(bytes32 _orderHash) external virtual;

    function settleAppeal(
        bytes32 _orderHash,
        AppealDecision _appealDecision
    ) external virtual;
}
