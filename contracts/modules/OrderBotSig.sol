// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IOrderBotSig.sol";
import "../interfaces/IOrder.sol";
import "../modules/OrderSig.sol";
import "../libraries/LibOrder.sol";
import "../libraries/LibAppeal.sol";
import "../libraries/LibSig.sol";
import "../globals/Errors.sol";

contract OrderBotSig is OrderSig, IOrderBotSig {
    function confirmOrder(
        OrderMethodPayload calldata _method,
        bytes calldata _sig
    )
        external
        virtual
        override
        sigNotExpired(_method.expiry)
        validSig(_sig)
        onlyOrderMethod(_method.method, OrderMethod.confirm)
    {
        bytes32 _orderMethodHash = LibSig._hashOrderMethodEIP712(_method);
        address caller = LibSig._signer(_orderMethodHash, _sig);
        LibOrder._payOrder(_method.orderHash, caller);
    }
}
