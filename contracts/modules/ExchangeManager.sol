// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeManager.sol";
import "../diamond/interfaces/IExchangeRoles.sol";

import "../libraries/LibData.sol";
import "../globals/Errors.sol";
contract ExchangeManager is IExchangeManager, IExchangeRoles {
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
        address _crossChainHandler,
        uint256 _orderFee,
        uint256 _collectedFees,
        uint256 _stakeAmount
    ) external virtual override onlyIExchangeManager {}

    function removeTradeToken(
        address _token
    ) external virtual override onlyIExchangeManager {
        OrderStore storage o = OrderStorage.load();
        if (o.stakeToken[_token].token == _token) {
            revert StakeTokenDoesNotExists();
        }
        delete o.stakeToken[_token];
        emit StakeTokenRemoved(msg.sender, _token);
    }

    function addPaymentMethod(
        bytes memory _paymentMethod,
        uint256 _buyLimit,
        uint256 _sellLimit
    ) external virtual override {}

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
    ) external virtual override {}

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
