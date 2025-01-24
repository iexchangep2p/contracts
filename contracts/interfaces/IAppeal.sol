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
    event OrderCancelled(uint256 orderId, OrderState status);
    event OrderAppealed(
        uint256 orderId,
        uint256 appealId,
        address appealer,
        AppealDecision appealDecision,
        OrderState status
    );

    function appealOrder(uint256 _orderId, bytes32 _reasonHash) external virtual;
}
