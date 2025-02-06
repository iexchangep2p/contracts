// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/LibData.sol";
import "./LibMerchant.sol";
import "./LibTransfer.sol";
import "../globals/Errors.sol";

library LibOrder {
    function _createOrder(
        IOrder.CreateOrder calldata _order,
        bytes32 _orderHash,
        OrderState _state
    ) internal {
        if (address(0) == _order.trader) {
            revert ZeroAddress();
        }
        if (address(0) == _order.merchant) {
            revert ZeroAddress();
        }
        if (address(0) == _order.token) {
            revert ZeroAddress();
        }
        if (_order.quantity < 1) {
            revert IOrder.InvalidQuantity();
        }
        if (_order.traderChain < 1) {
            revert InvalidChainId();
        }
        if (_order.merchantChain < 1) {
            revert InvalidChainId();
        }
        if (_order.duration < 1) {
            revert IOrder.InvalidDuration();
        }
        if (_order.expiry < 1) {
            revert IOrder.InvalidExpiry();
        }
        if (_order.expiry < block.timestamp) {
            revert IOrder.OrderExpired();
        }
        if (_state != OrderState.accepted && _state != OrderState.pending) {
            revert IOrder.InvalidOrderCreateState();
        }
        OrderStore storage o = OrderStorage.load();
        if (o.orders[_orderHash].createdAt > 0) {
            revert IOrder.OrderExists();
        }
        if (!o.currency[_order.currency].active) {
            revert IOrder.UnsupportedCurrency();
        }
        if (!o.paymentMethod[_order.paymentMethod].active) {
            revert IOrder.UnsupportedPaymentMethod();
        }
        if (!o.tradeToken[_order.token].active) {
            revert IOrder.InvalidTradeToken();
        }
        if (
            _order.duration < o.minPaymentTimeLimit ||
            _order.duration > o.maxPaymentTimeLimit
        ) {
            revert IOrder.InvalidDuration();
        }
        IMerchant.Merchant storage merchant = LibMerchant._get(_order.merchant);
        if (merchant.concurrentOrders >= o.maxConcurrentOrders) {
            revert IMerchant.MerchantConcurrencyReached();
        }
        // if (o.stakeToken[merchant.stakeToken.token].token == address(0)) {
        //     revert IMerchant.InvalidStakeToken();
        // }
        // if (
        //     merchant.stakeToken.stakeAmount <
        //     o.stakeToken[merchant.stakeToken.token].stakeAmount
        // ) {
        //     revert IMerchant.InvalidMerchantStake();
        // }
        o.orders[_orderHash] = IOrder.Order({
            trader: _order.trader,
            merchant: _order.merchant,
            traderChain: _order.traderChain,
            merchantChain: _order.merchantChain,
            token: _order.token,
            currency: _order.currency,
            paymentMethod: _order.paymentMethod,
            orderType: _order.orderType,
            orderState: _state,
            quantity: _order.quantity,
            deadline: block.timestamp + _order.duration,
            createdAt: block.timestamp
        });

        merchant.concurrentOrders += 1;

        if (_order.orderType == OrderType.buy) {
            if (_state == OrderState.accepted) {
                LibTransfer._receive(
                    _order.token,
                    _order.quantity,
                    _order.merchant
                );
            }
        }

        if (_order.orderType == OrderType.sell) {
            LibTransfer._receive(_order.token, _order.quantity, _order.trader);
        }

        emit IOrder.NewOrder(
            _orderHash,
            o.orders[_orderHash].trader,
            o.orders[_orderHash].merchant,
            o.orders[_orderHash].traderChain,
            o.orders[_orderHash].merchantChain,
            o.orders[_orderHash].token,
            o.orders[_orderHash].currency,
            o.orders[_orderHash].paymentMethod,
            o.orders[_orderHash].orderType,
            o.orders[_orderHash].quantity,
            o.orders[_orderHash].orderState,
            o.orders[_orderHash].deadline,
            o.orders[_orderHash].createdAt
        );
    }

    function _acceptOrder(bytes32 _orderHash, address _merchant) internal {
        OrderStore storage o = OrderStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].orderState != OrderState.pending) {
            revert IOrder.OrderPendingRequired();
        }
        if (_merchant != o.orders[_orderHash].merchant) {
            revert IOrder.MustBeMerchant();
        }
        o.orders[_orderHash].orderState = OrderState.accepted;
        if (o.orders[_orderHash].orderType == OrderType.buy) {
            LibTransfer._receive(
                o.orders[_orderHash].token,
                o.orders[_orderHash].quantity,
                _merchant
            );
        }
        emit IOrder.OrderAccepted(_orderHash, o.orders[_orderHash].orderState);
    }

    function _payOrder(bytes32 _orderHash, address _caller) internal {
        OrderStore storage o = OrderStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].orderType == OrderType.buy) {
            if (o.orders[_orderHash].orderState != OrderState.accepted) {
                revert IOrder.OrderAcceptedRequired();
            }
            if (_caller != o.orders[_orderHash].trader) {
                revert IOrder.MustBeTrader();
            }
        }
        if (o.orders[_orderHash].orderType == OrderType.sell) {
            if (
                o.orders[_orderHash].orderState != OrderState.pending &&
                o.orders[_orderHash].orderState != OrderState.accepted
            ) {
                revert IOrder.OrderPendingOrAcceptedRequired();
            }
            if (_caller != o.orders[_orderHash].merchant) {
                revert IOrder.MustBeMerchant();
            }
        }
        o.orders[_orderHash].orderState = OrderState.paid;
        emit IOrder.OrderPaid(_orderHash, o.orders[_orderHash].orderState);
    }

    function _releaseOrder(bytes32 _orderHash, address _caller) internal {
        OrderStore storage o = OrderStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].orderState != OrderState.paid) {
            revert IOrder.OrderPaidRequired();
        }
        o.orders[_orderHash].orderState = OrderState.released;
        LibMerchant
            ._getMerchant(o.orders[_orderHash].merchant)
            .concurrentOrders -= 1;
        uint256 fee = _computeOrderFee(
            o.tradeToken[o.orders[_orderHash].token],
            o.orders[_orderHash].quantity
        );
        uint256 remaining = o.orders[_orderHash].quantity - fee;
        o.tradeToken[o.orders[_orderHash].token].collectedFees += fee;
        if (o.orders[_orderHash].orderType == OrderType.buy) {
            if (_caller != o.orders[_orderHash].merchant) {
                revert IOrder.MustBeMerchant();
            }
            LibTransfer._crossChainSend(
                o.orders[_orderHash].token,
                remaining,
                o.orders[_orderHash].trader,
                o.orders[_orderHash].traderChain
            );
        }
        if (o.orders[_orderHash].orderType == OrderType.sell) {
            if (_caller != o.orders[_orderHash].trader) {
                revert IOrder.MustBeTrader();
            }
            LibTransfer._crossChainSend(
                o.orders[_orderHash].token,
                remaining,
                o.orders[_orderHash].merchant,
                o.orders[_orderHash].merchantChain
            );
        }
        emit IOrder.OrderReleased(_orderHash, o.orders[_orderHash].orderState);
    }

    function _cancelOrder(bytes32 _orderHash, address _caller) internal {
        OrderStore storage o = OrderStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].orderType == OrderType.buy) {
            if (o.orders[_orderHash].orderState != OrderState.accepted) {
                revert IOrder.OrderAcceptedRequired();
            }
            if (_caller != o.orders[_orderHash].trader) {
                revert IOrder.MustBeTrader();
            }
            LibTransfer._send(
                o.orders[_orderHash].token,
                o.orders[_orderHash].quantity,
                o.orders[_orderHash].merchant
            );
        }
        if (o.orders[_orderHash].orderType == OrderType.sell) {
            if (_caller != o.orders[_orderHash].merchant) {
                revert IOrder.MustBeMerchant();
            }
            LibTransfer._send(
                o.orders[_orderHash].token,
                o.orders[_orderHash].quantity,
                o.orders[_orderHash].trader
            );
        }
        o.orders[_orderHash].orderState = OrderState.cancelled;
        emit IOrder.OrderCancelled(_orderHash, o.orders[_orderHash].orderState);
    }

    function _cancelOrderAfterDeadline(bytes32 _orderHash) internal {
        OrderStore storage o = OrderStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].deadline > block.timestamp) {
            revert IOrder.NotYetDeadline();
        }
        if (
            o.orders[_orderHash].orderState != OrderState.pending &&
            o.orders[_orderHash].orderState != OrderState.accepted
        ) {
            revert IOrder.OrderPendingOrAcceptedRequired();
        }
        if (o.orders[_orderHash].orderType == OrderType.buy) {
            if (o.orders[_orderHash].orderState == OrderState.accepted) {
                LibTransfer._send(
                    o.orders[_orderHash].token,
                    o.orders[_orderHash].quantity,
                    o.orders[_orderHash].merchant
                );
            }
        }
        if (o.orders[_orderHash].orderType == OrderType.sell) {
            LibTransfer._send(
                o.orders[_orderHash].token,
                o.orders[_orderHash].quantity,
                o.orders[_orderHash].trader
            );
        }
        o.orders[_orderHash].orderState = OrderState.cancelled;
        emit IOrder.OrderCancelled(_orderHash, o.orders[_orderHash].orderState);
    }

    function _computeOrderFee(
        TradeToken memory _token,
        uint256 _amount
    ) internal pure returns (uint256) {
        return HelpersLib.basisPoint(_amount, _token.orderFee);
    }
}
