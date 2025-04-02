// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../globals/Types.sol";

abstract contract IOrder {
    struct Order {
        address trader;
        address merchant;
        uint256 traderChain;
        uint256 merchantChain;
        address token;
        bytes32 currency;
        bytes32 paymentMethod;
        OrderType orderType;
        OrderState orderState;
        uint256 quantity;
        uint256 deadline;
        uint256 createdAt;
    }

    struct CreateOrder {
        address trader;
        address merchant;
        uint256 traderChain;
        uint256 merchantChain;
        address token;
        bytes32 currency;
        bytes32 paymentMethod;
        OrderType orderType;
        uint256 quantity;
        uint256 expiry;
        uint256 duration;
    }

    event NewOrder(
        bytes32 orderHash,
        address trader,
        address merchant,
        uint256 traderChain,
        uint256 merchantChain,
        address token,
        bytes32 currency,
        bytes32 paymentMethod,
        OrderType orderType,
        uint256 quantity,
        OrderState orderState,
        uint256 deadline,
        uint256 createdAt
    );
    event OrderAccepted(bytes32 orderHash, OrderState status);
    event OrderPaid(bytes32 orderHash, OrderState status);
    event OrderReleased(bytes32 orderHash, OrderState status);
    event OrderCancelled(bytes32 orderHash, OrderState status);

    error InvalidOrderCreateState();
    error InvalidTradeToken();
    error InvalidDuration();
    error InvalidQuantity();
    error OrderExists();
    error OrderDoesNotExists();
    error NotYetDeadline();
    error InvalidExpiry();
    error OrderExpired();
    error OrderPendingRequired();
    error OrderAcceptedRequired();
    error OrderPendingOrAcceptedRequired();
    error OrderPaidRequired();
    error MustBeMerchant();
    error MustBeTrader();
    error MustBeMerchantOrTrader();

    function createOrder(CreateOrder calldata _order) external virtual;

    function acceptOrder(bytes32 _orderHash) external virtual;

    function payOrder(bytes32 _orderHash) external virtual;

    function releaseOrder(bytes32 _orderHash) external virtual;

    function cancelOrder(bytes32 _orderHash) external virtual;
}
