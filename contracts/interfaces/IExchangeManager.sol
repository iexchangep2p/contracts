// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IExchangeManager {
    event TradeTokenRemoved(address by, address token);
    event TradeTokenAdded(
        address by,
        address token,
        address crossChainHandler,
        uint256 orderFee,
        uint256 collectedFees
    );
    event TradeTokenUpdated(
        address by,
        address token,
        address crossChainHandler,
        uint256 orderFee,
        uint256 collectedFees
    );
    event MinPaymentTimeLimitSet(address by, uint256 val);
    event MaxPaymentTimeLimitSet(address by, uint256 val);
    error TradeTokenExists();
    error TradeTokenDoesNotExists();
    error InvalidMinPaymentTimeLimit();
    error InvalidMaxPaymentTimeLimit();
    function addTradeToken(
        address _token,
        address _crossChainSender,
        uint256 _orderFee
    ) external virtual;
    function updateTradeToken(
        address _token,
        address _crossChainSender,
        uint256 _orderFee
    ) external virtual;
    function removeTradeToken(address _token) external virtual;
    function setMinPaymentTimeLimit(uint256 _val) external virtual;
    function setMaxPaymentTimeLimit(uint256 _val) external virtual;
}
