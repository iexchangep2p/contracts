// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IExchangeManager {
    event PaymentMethodAdded(address by, bytes method, bool active);
    event PaymentMethodRemoved(address removedBy, bytes method, bool active);
    event CurrencyAdded(address by, bytes currency, bool active);
    event CurrencyRemoved(address by, bytes currency, bool active);
    event StakeTokenAdded(
        address by,
        address token,
        uint256 amount,
        bool active
    );
    event StakeTokenRemoved(
        address by,
        address token,
        uint256 amount,
        bool active
    );
    function addStakeToken(
        address _token,
        uint256 _stakeAmount
    ) external virtual;
    function removeStakeToken(address _token) external virtual;
    function addPaymentMethod(bytes memory _paymentMethod) external virtual;
    function removePaymentMethod(bytes memory _paymentMethod) external virtual;
    function addCurrency(bytes memory _currency) external virtual;
    function removeCurrency(bytes memory _currency) external virtual;
    function setAMLMinRemovePeriod(bytes memory _currency) external virtual;
    function setMinPaymentTimeLimit(uint256 _val) external virtual;
    function setMaxConcurrentOrders(uint256 _val) external virtual;
    function setMaxPaymentTimeLimit(uint256 _val) external virtual;
}
