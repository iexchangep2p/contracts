// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IOrder {
    enum OrderState {
        pending,
        accepted,
        paid,
        appealed,
        released,
        cancelled
    }
    enum OrderType {
        buy,
        sell
    }

    struct Order {
        address trader;
        address merchant;
        address token;
        bytes currency;
        bytes payment;
        OrderType orderType;
        OrderState orderState;
        uint256 quantity;
        address depositAddress;
        OrderState status;
        uint256 createdAt;
    }
    
    error MerchantConcurrencyReached(uint256 _count);
    error InvalidMerchantStake(uint256 _stakeAmount);
    error AcceptNotRequiredForSell();
    error UnsupportedCurrency();
    error UnsupportedPaymentMethod();
    error OrderAlreadyAppealed();
}
