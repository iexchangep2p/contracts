// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IAppeal.sol";
import "./IOrder.sol";

import "./IMerchant.sol";
import "../globals/Types.sol";
abstract contract IExchangeView {
    function getAppeal(
        address _address
    ) external view virtual returns (IAppeal.Appeal memory);
    function getPaymentMethod(
        bytes memory _address
    ) external view virtual returns (MoneyConfig memory);
    function getCurrency(
        bytes memory _address
    ) external view virtual returns (MoneyConfig memory);
    function getMerchant(
        address _address
    ) external view virtual returns (IMerchant.Merchant memory);
    function getOrder(
        uint256 _orderId
    ) external view virtual returns (IOrder.Order memory);
    function minAMLRemovePeriod() external view virtual returns (uint256);
    function minPaymentTimeLimit() external view virtual returns (uint256);
    function maxConcurrentOrders() external view virtual returns (uint256);
    function maxPaymentTimeLimit() external view virtual returns (uint256);
    function orderId() external view virtual returns (uint256);
}
