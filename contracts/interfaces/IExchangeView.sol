// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IAppeal.sol";
import "./IOrder.sol";
import "./IKYC.sol";

import "./IMerchant.sol";
import "../globals/Types.sol";
abstract contract IExchangeView {
    function appeals(
        address _address
    ) external view virtual returns (IAppeal.Appeal memory);
    function paymentMethod(
        bytes32 _address
    ) external view virtual returns (MoneyConfig memory);
    function currency(
        bytes32 _address
    ) external view virtual returns (MoneyConfig memory);
    function tradeToken(
        address _address
    ) external view virtual returns (TradeToken memory);
    function stakeToken(
        address _address
    ) external view virtual returns (StakeToken memory);
    function merchant(
        address _address
    ) external view virtual returns (IMerchant.Merchant memory);
    function order(
        bytes32 _orderHash
    ) external view virtual returns (IOrder.Order memory);
    function blacklisted(address _address) external view virtual returns (bool);
    function KYCLevel(
        address _address
    ) external view virtual returns (IKYC.KYCLevel);
    function minRemovePeriod() external view virtual returns (uint256);
    function appealId() external view virtual returns (uint256);
    function minAMLRemovePeriod() external view virtual returns (uint256);
    function minPaymentTimeLimit() external view virtual returns (uint256);
    function maxConcurrentOrders() external view virtual returns (uint256);
    function maxPaymentTimeLimit() external view virtual returns (uint256);
    function orderId() external view virtual returns (uint256);
}
