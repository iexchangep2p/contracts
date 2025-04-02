// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/LibData.sol";
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
        if (!o.tradeToken[_order.token].active) {
            revert IOrder.InvalidTradeToken();
        }
        if (
            _order.duration < o.minPaymentTimeLimit ||
            _order.duration > o.maxPaymentTimeLimit
        ) {
            revert IOrder.InvalidDuration();
        }
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
        if (o.orders[_orderHash].deadline > block.timestamp) {
            _cancelBeforeDeadline(_orderHash, _caller);
        } else {
            _cancelOrderAfterDeadline(_orderHash);
        }
    }

    function _cancelBeforeDeadline(
        bytes32 _orderHash,
        address _caller
    ) internal {
        OrderStore storage o = OrderStorage.load();
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

    function _settle(
        bytes32 _orderHash,
        IAppeal.AppealDecision _appealDecision
    ) internal {
        OrderStore storage o = OrderStorage.load();
        if (_appealDecision == IAppeal.AppealDecision.cancel) {
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
            emit IOrder.OrderCancelled(
                _orderHash,
                o.orders[_orderHash].orderState
            );
        }
        if (_appealDecision == IAppeal.AppealDecision.release) {
            o.orders[_orderHash].orderState = OrderState.released;
            uint256 fee = _computeOrderFee(
                o.tradeToken[o.orders[_orderHash].token],
                o.orders[_orderHash].quantity
            );
            uint256 remaining = o.orders[_orderHash].quantity - fee;
            o.tradeToken[o.orders[_orderHash].token].collectedFees += fee;
            if (o.orders[_orderHash].orderType == OrderType.buy) {
                LibTransfer._crossChainSend(
                    o.orders[_orderHash].token,
                    remaining,
                    o.orders[_orderHash].trader,
                    o.orders[_orderHash].traderChain
                );
            }
            if (o.orders[_orderHash].orderType == OrderType.sell) {
                LibTransfer._crossChainSend(
                    o.orders[_orderHash].token,
                    remaining,
                    o.orders[_orderHash].merchant,
                    o.orders[_orderHash].merchantChain
                );
            }
            emit IOrder.OrderReleased(
                _orderHash,
                o.orders[_orderHash].orderState
            );
        }
    }

    function _computeOrderFee(
        TradeToken memory _token,
        uint256 _amount
    ) internal pure returns (uint256) {
        return HelpersLib.basisPoint(_amount, _token.orderFee);
    }
}
