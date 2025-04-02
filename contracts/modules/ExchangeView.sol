// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeView.sol";
import "../libraries/LibData.sol";
import "../libraries/LibAppeal.sol";

contract ExchangeView is IExchangeView {

    function tradeToken(
        address _address
    ) external view virtual override returns (TradeToken memory) {
        return OrderStorage.load().tradeToken[_address];
    }

    function order(
        bytes32 _orderHash
    ) external view virtual override returns (IOrder.Order memory) {
        return OrderStorage.load().orders[_orderHash];
    }

    function minPaymentTimeLimit()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return OrderStorage.load().minPaymentTimeLimit;
    }

    function maxPaymentTimeLimit()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return OrderStorage.load().maxPaymentTimeLimit;
    }

    function appeal(
        bytes32 _orderHash
    ) external view virtual override returns (IAppeal.Appeal memory) {
        return LibAppeal._get(_orderHash);
    }
}
