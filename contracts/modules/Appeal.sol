// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/LibAppeal.sol";
import "../diamond/interfaces/IExchangeRoles.sol";
contract Appeal is IAppeal, IExchangeRoles {
    function appealOrder(bytes32 _orderHash) external virtual override {
        LibAppeal._appeal(_orderHash, msg.sender);
    }

    function settleAppeal(
        bytes32 _orderHash,
        AppealDecision _appealDecision
    ) external virtual override {
        LibAppeal._settle(_orderHash, _appealDecision, msg.sender);
    }

    function cancelAppeal(bytes32 _orderHash) external virtual override {
        LibAppeal._cancel(_orderHash, msg.sender);
    }
}
