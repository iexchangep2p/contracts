// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IOrder.sol";
import "../libraries/LibOrder.sol";

import "../libraries/LibSig.sol";
contract Order is IOrder {
    function createOrder(
        CreateOrder calldata _order
    ) external virtual override {
        bytes32 _orderHash = LibSig._hashOrderEIP712(_order);
        if (_order.trader != msg.sender) {
            revert InvalidSigner();
        }

        LibOrder._createOrder(_order, _orderHash, OrderState.pending);
    }

    function acceptOrder(bytes32 _orderHash) external virtual override {
        LibOrder._acceptOrder(_orderHash, msg.sender);
    }

    function payOrder(bytes32 _orderHash) external virtual override {
        LibOrder._payOrder(_orderHash, msg.sender);
    }

    function releaseOrder(bytes32 _orderHash) external virtual override {
        LibOrder._releaseOrder(_orderHash, msg.sender);
    }

    function cancelOrder(bytes32 _orderHash) external virtual override {
        LibOrder._cancelOrder(_orderHash, msg.sender);
    }
}
