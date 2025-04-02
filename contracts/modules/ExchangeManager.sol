// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeManager.sol";
import "../diamond/interfaces/IExchangeRoles.sol";

import "../libraries/LibData.sol";
import "../globals/Errors.sol";
import "../globals/Helpers.sol";
import "../globals/Types.sol";
contract ExchangeManager is IExchangeManager, IExchangeRoles, Helpers {
    function addTradeToken(
        address _token,
        address _crossChainSender,
        uint256 _orderFee
    )
        external
        virtual
        override
        onlyIExchangeManager
        positiveAddress(_crossChainSender)
        nonZero(_orderFee)
    {
        OrderStore storage o = OrderStorage.load();
        if (o.tradeToken[_token].active) {
            revert TradeTokenExists();
        }
        o.tradeToken[_token] = TradeToken({
            active: true,
            crossChainSender: _crossChainSender,
            orderFee: _orderFee,
            collectedFees: 0
        });
        emit TradeTokenAdded(
            msg.sender,
            _token,
            o.tradeToken[_token].crossChainSender,
            o.tradeToken[_token].orderFee,
            o.tradeToken[_token].collectedFees
        );
    }

    function updateTradeToken(
        address _token,
        address _crossChainSender,
        uint256 _orderFee
    )
        external
        virtual
        override
        onlyIExchangeManager
        positiveAddress(_crossChainSender)
        nonZero(_orderFee)
    {
        OrderStore storage o = OrderStorage.load();
        if (!o.tradeToken[_token].active) {
            revert TradeTokenDoesNotExists();
        }
        o.tradeToken[_token].crossChainSender = _crossChainSender;
        o.tradeToken[_token].orderFee = _orderFee;
        emit TradeTokenUpdated(
            msg.sender,
            _token,
            o.tradeToken[_token].crossChainSender,
            o.tradeToken[_token].orderFee,
            o.tradeToken[_token].collectedFees
        );
    }

    function removeTradeToken(
        address _token
    ) external virtual override onlyIExchangeManager {
        OrderStore storage o = OrderStorage.load();
        if (!o.tradeToken[_token].active) {
            revert TradeTokenDoesNotExists();
        }
        delete o.tradeToken[_token];
        emit TradeTokenRemoved(msg.sender, _token);
    }

    function setMinPaymentTimeLimit(
        uint256 _val
    ) external virtual override onlyIExchangeManager nonZero(_val) {
        if (_val >= OrderStorage.load().maxPaymentTimeLimit) {
            revert InvalidMinPaymentTimeLimit();
        }
        OrderStorage.load().minPaymentTimeLimit = _val;
        emit MinPaymentTimeLimitSet(msg.sender, _val);
    }

    function setMaxPaymentTimeLimit(
        uint256 _val
    ) external virtual override onlyIExchangeManager nonZero(_val) {
        if (_val <= OrderStorage.load().minPaymentTimeLimit) {
            revert InvalidMaxPaymentTimeLimit();
        }
        OrderStorage.load().maxPaymentTimeLimit = _val;
        emit MaxPaymentTimeLimitSet(msg.sender, _val);
    }
}
