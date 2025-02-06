// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IAppeal.sol";
contract Appeal is IAppeal {
    function appealOrder(bytes32 _orderHash) external virtual override {}

    function settleAppeal(
        bytes32 _orderHash,
        AppealDecision _appealDecision
    ) external virtual override {}
}
