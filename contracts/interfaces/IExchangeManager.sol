// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IExchangeManager {
    event PaymentMethodAdded(address by, bytes32 method);
    event PaymentMethodRemoved(address by, bytes32 method);
    event CurrencyAdded(address by, bytes32 currency);
    event CurrencyRemoved(address by, bytes32 currency);
    event StakeTokenAdded(address by, address token, uint256 amount);
    event StakeTokenRemoved(address by, address token);
    event AMLMinRemovePeriodSet(address by, uint256 val);
    event MinPaymentTimeLimitSet(address by, uint256 val);
    event MaxConcurrentOrdersSet(address by, uint256 val);
    event MaxPaymentTimeLimitSet(address by, uint256 val);
    error StakeTokenExists();
    error StakeTokenDoesNotExists();
    error InvalidStakeAmount();
    error PaymentMethodDoesNotExist();
    error CurrencyDoesNotExist();
    function addStakeToken(
        address _token,
        uint256 _stakeAmount
    ) external virtual;
    function removeStakeToken(address _token) external virtual;
    function addTradeToken(
        address _token,
        uint256 _stakeAmount
    ) external virtual;
    function removeTradeToken(address _token) external virtual;
    function addPaymentMethod(
        bytes memory _paymentMethod,
        uint256 buyLimit,
        uint256 sellLimit
    ) external virtual;
    function removePaymentMethod(bytes32 _methodHash) external virtual;
    function addCurrency(
        bytes memory _currency,
        uint256 buyLimit,
        uint256 sellLimit
    ) external virtual;
    function removeCurrency(bytes32 _currencyHash) external virtual;
    function setAMLMinRemovePeriod(uint256 _val) external virtual;
    function setMinPaymentTimeLimit(uint256 _val) external virtual;
    function setMaxConcurrentOrders(uint256 _val) external virtual;
    function setMaxPaymentTimeLimit(uint256 _val) external virtual;
}
