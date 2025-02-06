// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeView.sol";
import "../libraries/LibData.sol";
import "../libraries/LibKYC.sol";
import "../libraries/LibAML.sol";

contract ExchangeView is IExchangeView {
    function appeals(
        address _address
    ) external view virtual override returns (IAppeal.Appeal memory) {}

    function paymentMethod(
        bytes32 _address
    ) external view virtual override returns (MoneyConfig memory) {}

    function currency(
        bytes32 _address
    ) external view virtual override returns (MoneyConfig memory) {}

    function tradeToken(
        address _address
    ) external view virtual override returns (TradeToken memory) {}

    function stakeToken(
        address _address
    ) external view virtual override returns (StakeToken memory) {}

    function merchant(
        address _address
    ) external view virtual override returns (IMerchant.Merchant memory) {}

    function order(
        bytes32 _orderHash
    ) external view virtual override returns (IOrder.Order memory) {}

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

    function minRemovePeriod()
        external
        view
        virtual
        override
        returns (uint256)
    {}

    function appealId() external view virtual override returns (uint256) {}

    function minAMLRemovePeriod()
        external
        view
        virtual
        override
        returns (uint256)
    {}

    function minPaymentTimeLimit()
        external
        view
        virtual
        override
        returns (uint256)
    {}

    function maxConcurrentOrders()
        external
        view
        virtual
        override
        returns (uint256)
    {}

    function maxPaymentTimeLimit()
        external
        view
        virtual
        override
        returns (uint256)
    {}

    function orderId() external view virtual override returns (uint256) {}
}
