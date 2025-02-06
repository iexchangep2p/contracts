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
        uint256 orderId;
        address appealer;
        bytes32 reasonHash;
        AppealDecision appealDecision;
        uint256 createdAt;
    }
    event OrderAppealed(
        uint256 orderId,
        uint256 appealId,
        address appealer,
        AppealDecision appealDecision,
        OrderState status
    );
    error OrderAlreadyAppealed();

    function appealOrder(bytes32 _orderHash) external virtual;

    function settleAppeal(
        bytes32 _orderHash,
        AppealDecision _appealDecision
    ) external virtual;

    
}
