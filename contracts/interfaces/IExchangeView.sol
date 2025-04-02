// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IAppeal.sol";
import "./IOrder.sol";

import "../globals/Types.sol";
abstract contract IExchangeView {
    function tradeToken(
        address _address
    ) external view virtual returns (TradeToken memory);
    function order(
        bytes32 _orderHash
    ) external view virtual returns (IOrder.Order memory);
    function maxPaymentTimeLimit() external view virtual returns (uint256);
    function minPaymentTimeLimit() external view virtual returns (uint256);
    function appeal(
        bytes32 _orderHash
    ) external view virtual returns (IAppeal.Appeal memory);
}
