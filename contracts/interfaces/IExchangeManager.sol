// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IExchangeManager {
    event TokenAdded(address by, address token);
    event TokenRemoved(address by, address token);
    event PaymentMethodAdded(address by, string method);
    event PaymentMethodRemoved(address removedBy, string method);
    event CurrencyAdded(address by, string currency);
    event CurrencyRemoved(address by, string currency);
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
}
