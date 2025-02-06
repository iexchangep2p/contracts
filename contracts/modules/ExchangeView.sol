// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeView.sol";
import "../libraries/LibData.sol";
import "../libraries/LibKYC.sol";
import "../libraries/LibAML.sol";
import "../libraries/LibAppeal.sol";

contract ExchangeView is IExchangeView {
    function paymentMethod(
        bytes32 _method
    ) external view virtual override returns (MoneyConfig memory) {
        return OrderStorage.load().paymentMethod[_method];
    }

    function currency(
        bytes32 _currency
    ) external view virtual override returns (MoneyConfig memory) {
        return OrderStorage.load().currency[_currency];
    }

    function tradeToken(
        address _address
    ) external view virtual override returns (TradeToken memory) {
        return OrderStorage.load().tradeToken[_address];
    }

    function stakeToken(
        address _address
    ) external view virtual override returns (StakeToken memory) {
        return OrderStorage.load().stakeToken[_address];
    }

    function merchant(
        address _address
    ) external view virtual override returns (IMerchant.Merchant memory) {
        return OrderStorage.load().merchant[_address];
    }

    function order(
        bytes32 _orderHash
    ) external view virtual override returns (IOrder.Order memory) {
        return OrderStorage.load().orders[_orderHash];
    }

    function blacklisted(
        address _address
    ) external view virtual override returns (bool) {
        return LibAML._is(_address);
    }

    function KYCLevel(
        address _address
    ) external view virtual override returns (IKYC.KYCLevel) {
        return LibKYC._get(_address);
    }

    function minAMLRemovePeriod()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return AMLStorage.load().minRemovePeriod;
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

    function maxConcurrentOrders()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return OrderStorage.load().maxConcurrentOrders;
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

    function appeals(
        bytes32 _orderHash
    ) external view virtual override returns (IAppeal.Appeal memory) {
        return LibAppeal._get(_orderHash);
    }
}
