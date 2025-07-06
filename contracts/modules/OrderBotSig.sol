// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IOrderSig.sol";
import "../interfaces/IOrder.sol";
import "../interfaces/IOrderBotSig.sol";
import "../libraries/LibOrder.sol";
import "../libraries/LibAppeal.sol";
import "../libraries/LibSig.sol";
import "../libraries/LibBot.sol";
import "../globals/Errors.sol";
import "../globals/OrderHelpers.sol";

contract OrderBotSig is IOrderBotSig, OrderHelpers {
    function createOrderBot(
        IOrder.CreateOrder calldata _order,
        bytes calldata _traderSig,
        bytes calldata _botSig
    ) external virtual override sigNotExpired(_order.expiry) validSig(_botSig) {
        address bot = LibBot._merchantBot(_order.merchant);
        OrderState state;
        bytes32 _orderHash = LibSig._hashOrderEIP712(_order);
        address trader = LibSig._signer(_orderHash, _traderSig);
        if (_order.trader != trader) {
            revert InvalidSigner();
        }
        address _signerBot = LibSig._signer(_orderHash, _botSig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        state = OrderState.accepted;

        LibOrder._createOrder(_order, _orderHash, state);
    }

    function acceptOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.accept)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibOrder._acceptOrder(_method.orderHash, merchant);
    }

    function releaseOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.release)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibOrder._releaseOrder(_method.orderHash, merchant);
    }

    function cancelOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.cancel)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibOrder._cancelOrder(_method.orderHash, merchant);
    }

    function payOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.pay)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibOrder._payOrder(_method.orderHash, merchant);
    }

    function appealOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.appeal)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibAppeal._appeal(_method.orderHash, merchant);
    }

    function cancelAppealBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.cancelAppeal)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibAppeal._cancel(_method.orderHash, merchant);
    }

    function confirmOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, IOrderSig.OrderMethod.confirm)
    {
        address merchant = LibOrder._get(_method.orderHash).merchant;
        address bot = LibBot._merchantBot(merchant);
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address _signerBot = LibSig._signer(_orderMethodHash, _sig);
        if (bot != _signerBot) {
            revert InvalidBotSigner();
        }
        LibOrder._confirmOrder(_method.orderHash, merchant);
    }

    function setBot(address _bot) external virtual override {
        LibBot._setBot(msg.sender, _bot);
    }

    function removeBot() external virtual override {
        LibBot._removeBot(msg.sender);
    }

    function merchantBot(
        address _merchant
    ) external view virtual override returns (address) {
        return LibBot._merchantBot(_merchant);
    }
}
