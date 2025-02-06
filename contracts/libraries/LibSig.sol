// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IOrder.sol";
library LibSig {
    function _signer(
        bytes32 _hash,
        bytes calldata _signature
    ) internal returns (address) {}

    function _harshOrder(
        IOrder.CreateOrder calldata _order
    ) internal returns (bytes32) {}
}
