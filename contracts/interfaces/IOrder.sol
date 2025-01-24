// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../globals/Types.sol";

abstract contract IOrder {
    

    struct Order {
        address trader;
        address merchant;
        address token;
        bytes currency;
        bytes paymentMethod;
        bytes paymentConfig;
        OrderType orderType;
        OrderState orderState;
        uint256 quantity;
        address depositAddress;
        OrderState status;
        uint256 createdAt;
    }

    event NewMerchant(address  merchant);
    event NewSettler(address  settler);
    event NewTrader(address  trader);
    event OfferDisabled(uint256  offerId, bool  active);
    event OfferEnabled(uint256  offerId, bool  active);
    event NewOrder(
        uint256  orderId,
        address  trader,
        OrderType  orderType,
        uint256 offerId,
        uint256 quantity,
        address depositAddress,
        bytes32 accountHash,
        uint256 appealId,
        OrderState status
    );
    event OrderAccepted(uint256  orderId, OrderState  status);
    event OrderPaid(uint256  orderId, OrderState  status);
    event OrderReleased(uint256  orderId, OrderState  status);
    
    

    error MerchantConcurrencyReached(uint256 _count);
    error InvalidMerchantStake(uint256 _stakeAmount);
    error AcceptNotRequiredForSell();
    error UnsupportedCurrency();
    error UnsupportedPaymentMethod();
    error OrderAlreadyAppealed();
}
