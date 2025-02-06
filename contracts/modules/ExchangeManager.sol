// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IExchangeManager.sol";
contract ExchangeManager is IExchangeManager {
    function addStakeToken(
        address _token,
        uint256 _stakeAmount
    ) external virtual override {}

    function removeStakeToken(address _token) external virtual override {}

    function addPaymentMethod(
        bytes memory _paymentMethod
    ) external virtual override {}

    function removePaymentMethod(
        bytes memory _paymentMethod
    ) external virtual override {}

    function addCurrency(bytes memory _currency) external virtual override {}

    function removeCurrency(bytes memory _currency) external virtual override {}

    function setAMLMinRemovePeriod(
        bytes memory _currency
    ) external virtual override {}

    function setMinPaymentTimeLimit(uint256 _val) external virtual override {}

    function setMaxConcurrentOrders(uint256 _val) external virtual override {}

    function setMaxPaymentTimeLimit(uint256 _val) external virtual override {}

    function addTradeToken(
        address _token,
        uint256 _stakeAmount
    ) external virtual override {}

    function removeTradeToken(address _token) external virtual override {}
}
