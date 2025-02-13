// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeManager.sol";
import "../diamond/interfaces/IExchangeRoles.sol";

import "../libraries/LibData.sol";
import "../globals/Errors.sol";
import "../globals/Helpers.sol";
import "../globals/Types.sol";
contract ExchangeManager is IExchangeManager, IExchangeRoles, Helpers {
    function addStakeToken(
        address _token,
        uint256 _stakeAmount
    ) external virtual override onlyIExchangeManager {
        OrderStore storage o = OrderStorage.load();
        if (o.stakeToken[_token].token != address(0)) {
            revert StakeTokenExists();
        }
        if (_stakeAmount == 0) {
            revert InvalidStakeAmount();
        }
        o.stakeToken[_token] = StakeToken(_token, _stakeAmount);
        emit StakeTokenAdded(msg.sender, _token, _stakeAmount);
    }

    function removeStakeToken(
        address _token
    ) external virtual override onlyIExchangeManager {
        OrderStore storage o = OrderStorage.load();
        if (o.stakeToken[_token].token == _token) {
            revert StakeTokenDoesNotExists();
        }
        delete o.stakeToken[_token];
        emit StakeTokenRemoved(msg.sender, _token);
    }

    function addTradeToken(
        address _token,
        uint256 _buyLimit,
        uint256 _sellLimit,
        address _crossChainSender,
        uint256 _orderFee,
        uint256 _stakeAmount
    )
        external
        virtual
        override
        onlyIExchangeManager
        nonZero(_buyLimit)
        nonZero(_sellLimit)
        positiveAddress(_crossChainSender)
        nonZero(_orderFee)
        nonZero(_stakeAmount)
    {
        OrderStore storage o = OrderStorage.load();
        if (o.tradeToken[_token].active) {
            revert TradeTokenExists();
        }
        o.tradeToken[_token] = TradeToken({
            active: true,
            buyLimit: _buyLimit,
            sellLimit: _sellLimit,
            crossChainSender: _crossChainSender,
            orderFee: _orderFee,
            collectedFees: 0,
            stakeAmount: _stakeAmount
        });
        emit TradeTokenAdded(
            msg.sender,
            _token,
            o.tradeToken[_token].buyLimit,
            o.tradeToken[_token].sellLimit,
            o.tradeToken[_token].crossChainSender,
            o.tradeToken[_token].orderFee,
            o.tradeToken[_token].collectedFees,
            o.tradeToken[_token].stakeAmount
        );
    }

    function removeTradeToken(
        address _token
    ) external virtual override onlyIExchangeManager {
        OrderStore storage o = OrderStorage.load();
        if (o.stakeToken[_token].token == _token) {
            revert TradeTokenDoesNotExists();
        }
        delete o.stakeToken[_token];
        emit TradeTokenRemoved(msg.sender, _token);
    }

    function addPaymentMethod(
        bytes memory _paymentMethod,
        uint256 _buyLimit,
        uint256 _sellLimit
    ) external virtual override {
        OrderStore storage o = OrderStorage.load();
        bytes32 methodHash = keccak256(_paymentMethod);
        if (o.paymentMethod[methodHash].active) {
            revert PaymentMethodExist();
        }
        o.paymentMethod[methodHash] = MoneyConfig({
            active: true,
            buyLimit: _buyLimit,
            sellLimit: _sellLimit,
            value: _paymentMethod
        });
        emit PaymentMethodAdded(
            msg.sender,
            methodHash,
            o.paymentMethod[methodHash].buyLimit,
            o.paymentMethod[methodHash].sellLimit
        );
    }

    function removePaymentMethod(
        bytes32 _methodHash
    ) external virtual override {
        OrderStore storage o = OrderStorage.load();
        if (o.paymentMethod[_methodHash].active) {
            revert PaymentMethodDoesNotExist();
        }
        delete o.paymentMethod[_methodHash];
        emit PaymentMethodRemoved(msg.sender, _methodHash);
    }

    function addCurrency(
        bytes memory _currency,
        uint256 _buyLimit,
        uint256 _sellLimit
    ) external virtual override {
        OrderStore storage o = OrderStorage.load();
        bytes32 currencyHash = keccak256(_currency);
        if (o.currency[currencyHash].active) {
            revert CurrencyExist();
        }
        o.currency[currencyHash] = MoneyConfig({
            active: true,
            buyLimit: _buyLimit,
            sellLimit: _sellLimit,
            value: _currency
        });
        emit CurrencyAdded(
            msg.sender,
            currencyHash,
            o.paymentMethod[currencyHash].buyLimit,
            o.paymentMethod[currencyHash].sellLimit
        );
    }

    function removeCurrency(bytes32 _currencyHash) external virtual override {
        OrderStore storage o = OrderStorage.load();
        if (o.currency[_currencyHash].active) {
            revert CurrencyDoesNotExist();
        }
        delete o.currency[_currencyHash];
        emit CurrencyRemoved(msg.sender, _currencyHash);
    }

    function setAMLMinRemovePeriod(
        uint256 _val
    ) external virtual override onlyIExchangeManager {
        if (_val == 0) {
            revert ZeroNumber();
        }
        AMLStorage.load().minRemovePeriod = _val;
        emit AMLMinRemovePeriodSet(msg.sender, _val);
    }

    function setMinPaymentTimeLimit(
        uint256 _val
    ) external virtual override onlyIExchangeManager {
        if (_val == 0) {
            revert ZeroNumber();
        }
        OrderStorage.load().minPaymentTimeLimit = _val;
        emit MinPaymentTimeLimitSet(msg.sender, _val);
    }

    function setMaxConcurrentOrders(
        uint256 _val
    ) external virtual override onlyIExchangeManager {
        if (_val == 0) {
            revert ZeroNumber();
        }
        OrderStorage.load().maxPaymentTimeLimit = _val;
        emit MaxConcurrentOrdersSet(msg.sender, _val);
    }

    function setMaxPaymentTimeLimit(
        uint256 _val
    ) external virtual override onlyIExchangeManager {
        if (_val == 0) {
            revert ZeroNumber();
        }
        OrderStorage.load().maxConcurrentOrders = _val;
        emit MaxPaymentTimeLimitSet(msg.sender, _val);
    }
}
