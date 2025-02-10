// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@solidstate/contracts/cryptography/EIP712.sol";
import "@solidstate/contracts/cryptography/ECDSA.sol";
import "../interfaces/IOrder.sol";

/**
 * @author  .
 * @title   .
 * @dev     refer https://github.com/cowprotocol/contracts/blob/main/test/libraries/Eip712.sol
 * @notice  .
 */

library LibSig {
    bytes32 internal constant DOMAIN_NAME = keccak256("IExchange P2P Protocol");

    bytes32 internal constant DOMAIN_VERSION = keccak256("v2");

    bytes32 internal constant CREATE_ORDER_TYPE_HASH =
        keccak256(
            "CreateOrder(address trader,address merchant,uint256 traderChain,uint256 merchantChain,address token,bytes32 currency,bytes32 paymentMethod,uint8 orderType,uint256 quantity,uint256 expiry,uint256 duration)"
        );

    function _signer(
        bytes32 _hash,
        bytes calldata _signature
    ) internal pure returns (address) {
        return ECDSA.recover(_hash, _signature);
    }

    function _hashOrderEIP712(
        IOrder.CreateOrder calldata _order
    ) internal view returns (bytes32) {
        bytes32 createOrderHashStruct = keccak256(
            abi.encode(
                CREATE_ORDER_TYPE_HASH,
                _order.trader,
                _order.merchant,
                _order.traderChain,
                _order.merchantChain,
                _order.token,
                _order.currency,
                _order.paymentMethod,
                _order.orderType,
                _order.quantity,
                _order.expiry,
                _order.duration
            )
        );
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    _domainSeparator(),
                    createOrderHashStruct
                )
            );
    }

    function _domainSeparator() internal view returns (bytes32) {
        return EIP712.calculateDomainSeparator(DOMAIN_NAME, DOMAIN_VERSION);
    }
}
