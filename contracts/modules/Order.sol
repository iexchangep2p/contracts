// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IOrder.sol";
import "../libraries/LibOrder.sol";

import "../libraries/LibSig.sol";
contract Order is IOrder {
    function createOrder(
        CreateOrder calldata _order,
        bytes calldata _traderSig,
        bytes calldata _merchantSig
    ) external virtual override {
        if (!HelpersLib.compareBytes(_traderSig, HelpersLib.emptyBytes)) {}
        OrderState state;
        bytes32 _orderHash = LibSig._harshOrder(_order);
        address trader = LibSig._signer(_orderHash, _traderSig);
        if (_order.trader != trader) {
            revert InvalidSigner();
        }
        if (HelpersLib.compareBytes(_merchantSig, HelpersLib.emptyBytes)) {
            state = OrderState.pending;
        } else {
            address merchant = LibSig._signer(_orderHash, _merchantSig);
            if (_order.merchant != merchant) {
                revert InvalidSigner();
            }
            state = OrderState.accepted;
        }

        LibOrder._createOrder(_order, _orderHash, state);
    }

    function acceptOrder(
        bytes32 _orderHash,
        bytes calldata _sig
    ) external virtual override {
        LibOrder._acceptOrder(_orderHash, LibSig._signer(_orderHash, _sig));
    }

    function payOrder(
        bytes32 _orderHash,
        bytes calldata _sig
    ) external virtual override {
        LibOrder._payOrder(_orderHash, LibSig._signer(_orderHash, _sig));
    }

    function releaseOrder(
        bytes32 _orderHash,
        bytes calldata _sig
    ) external virtual override {
        LibOrder._releaseOrder(_orderHash, LibSig._signer(_orderHash, _sig));
    }

    function cancelOrder(
        bytes32 _orderHash,
        bytes calldata _sig
    ) external virtual override {
        LibOrder._cancelOrder(_orderHash, LibSig._signer(_orderHash, _sig));
    }
}
