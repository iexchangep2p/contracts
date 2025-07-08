// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../globals/Types.sol";
import "./IOrderSig.sol";
import "./IOrder.sol";

/**
 * @title   Order Bot Signature based
 * @dev     Handles automated trading on behalf of merchant. Merchant can set and remove bot anytime.
 * @notice  It is assumed only bot set by merchant will call the methods in this facet.
 */

abstract contract IOrderBotSig {
    event BotSet(address merchant, address bot);
    event BotRemoved(address merchant, address bot);
    error NoBotSet();
    function createOrderBot(
        IOrder.CreateOrder calldata _order,
        bytes calldata _traderSig,
        bytes calldata _botSig
    ) external virtual;

    function acceptOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function payOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function releaseOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function cancelOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function appealOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function cancelAppealBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function confirmOrderBot(
        IOrderSig.OrderMethodPayload calldata _method,
        bytes calldata _sig
    ) external virtual;

    function setBot(address _bot) external virtual;

    function removeBot() external virtual;

    function merchantBot(
        address _merchant
    ) external view virtual returns (address);
}
