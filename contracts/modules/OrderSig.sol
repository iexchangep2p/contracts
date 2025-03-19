// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IOrderSig.sol";
import "../interfaces/IOrder.sol";
import "../libraries/LibOrder.sol";
import "../libraries/LibAppeal.sol";
import "../libraries/LibSig.sol";
import "../globals/Errors.sol";
contract OrderSig is IOrderSig {
    modifier validSig(bytes calldata _sig) {
        if (HelpersLib.compareBytes(_sig, HelpersLib.emptyBytes)) {
            revert InvalidSignature();
        }
        _;
    }

    modifier sigNotExpired(uint256 _expiry) {
        if (_expiry < block.timestamp) {
            revert SignatureExpired();
        }
        _;
    }

    modifier onlyOrderMethod(OrderMethod _method, OrderMethod _expected) {
        if (_method != _expected) {
            revert InvalidOrderMethodCall();
        }
        _;
    }

    function createOrder(
        IOrder.CreateOrder calldata _order,
        bytes calldata _traderSig,
        bytes calldata _merchantSig
    )
        external
        virtual
        override
        sigNotExpired(_order.expiry)
        validSig(_traderSig)
    {
        OrderState state;
        bytes32 _orderHash = LibSig._hashOrderEIP712(_order);
        address trader = LibSig._signer(_orderHash, _traderSig);
        if (_order.trader != trader) {
            revert InvalidSigner();
        }
        if (HelpersLib.compareBytes(_merchantSig, HelpersLib.emptyBytes)) {
            if (msg.sender == _order.merchant) {
                state = OrderState.accepted;
            } else {
                state = OrderState.pending;
            }
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
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, OrderMethod.accept)
    {
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address caller = LibSig._signer(_orderMethodHash, _sig);
        LibOrder._acceptOrder(_method.orderHash, caller);
    }

    function releaseOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, OrderMethod.release)
    {
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address caller = LibSig._signer(_orderMethodHash, _sig);
        LibOrder._releaseOrder(_method.orderHash, caller);
    }

    function cancelOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, OrderMethod.cancel)
    {
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address caller = LibSig._signer(_orderMethodHash, _sig);
        LibOrder._cancelOrder(_method.orderHash, caller);
    }

    function payOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, OrderMethod.pay)
    {
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address caller = LibSig._signer(_orderMethodHash, _sig);
        LibOrder._payOrder(_method.orderHash, caller);
    }

    function appealOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, OrderMethod.pay)
    {
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address caller = LibSig._signer(_orderMethodHash, _sig);
        LibAppeal._appeal(_method.orderHash, caller);
    }
}
