// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/LibData.sol";
import "../globals/Errors.sol";
import "../libraries/LibOrder.sol";

library LibAppeal {
    function _get(
        bytes32 _orderHash
    ) internal view returns (IAppeal.Appeal memory) {
        return AppealStorage.load().appeals[_orderHash];
    }

    function _appeal(bytes32 _orderHash, address _caller) internal {
        OrderStore storage o = OrderStorage.load();
        AppealStore storage a = AppealStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (a.appeals[_orderHash].createdAt > 0) {
            revert IOrder.AppealExists();
        }
        if (o.orders[_orderHash].orderState != OrderState.paid) {
            revert IOrder.OrderPaidRequired();
        }
        if (
            _caller != o.orders[_orderHash].merchant &&
            _caller != o.orders[_orderHash].trader
        ) {
            revert IOrder.MustBeMerchantOrTrader();
        }
        o.orders[_orderHash].orderState = OrderState.appealed;

        a.appeals[_orderHash] = IAppeal.Appeal({
            orderHash: _orderHash,
            appealer: _caller,
            appealDecision: IAppeal.AppealDecision.unvoted,
            createdAt: block.timestamp,
            cancelledAt: 0,
            settler: address(0),
            settledAt: 0
        });

        emit IAppeal.OrderAppealed(
            a.appeals[_orderHash].orderHash,
            a.appeals[_orderHash].appealer,
            a.appeals[_orderHash].appealDecision,
            o.orders[_orderHash].orderState,
            a.appeals[_orderHash].createdAt
        );
    }

    function _cancel(bytes32 _orderHash, address _caller) internal {
        OrderStore storage o = OrderStorage.load();
        AppealStore storage a = AppealStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].orderState != OrderState.appealed) {
            revert IOrder.OrderAppealedRequired();
        }
        if (a.appeals[_orderHash].appealer != _caller) {
            revert IOrder.MustBeAppealer();
        }
        o.orders[_orderHash].orderState = OrderState.paid;
        a.appeals[_orderHash].cancelledAt = block.timestamp;
        emit IAppeal.AppealCancelled(
            a.appeals[_orderHash].orderHash,
            a.appeals[_orderHash].appealer,
            a.appeals[_orderHash].appealDecision,
            o.orders[_orderHash].orderState,
            a.appeals[_orderHash].cancelledAt
        );
    }

    function _settle(
        bytes32 _orderHash,
        IAppeal.AppealDecision _appealDecision,
        address _caller
    ) internal {
        OrderStore storage o = OrderStorage.load();
        AppealStore storage a = AppealStorage.load();
        if (o.orders[_orderHash].createdAt == 0) {
            revert IOrder.OrderDoesNotExists();
        }
        if (o.orders[_orderHash].orderState != OrderState.appealed) {
            revert IOrder.OrderAppealedRequired();
        }
        if (_appealDecision == IAppeal.AppealDecision.unvoted) {
            revert IOrder.InvalidAppealDecision();
        }
        a.appeals[_orderHash].settledAt = block.timestamp;
        a.appeals[_orderHash].settler = _caller;
        a.appeals[_orderHash].appealDecision = _appealDecision;
        LibOrder._settle(_orderHash, _appealDecision);
        emit IAppeal.AppealSettled(
            a.appeals[_orderHash].orderHash,
            a.appeals[_orderHash].appealer,
            a.appeals[_orderHash].settler,
            a.appeals[_orderHash].appealDecision,
            o.orders[_orderHash].orderState,
            a.appeals[_orderHash].settledAt
        );
    }
}
