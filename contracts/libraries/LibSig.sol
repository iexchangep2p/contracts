// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@solidstate/contracts/cryptography/EIP712.sol";
import "@solidstate/contracts/cryptography/ECDSA.sol";
import "../interfaces/IOrder.sol";
library LibSig {
    /// @dev The EIP-712 domain name used for computing the domain separator.
    bytes32 internal constant DOMAIN_NAME = keccak256("IExchange P2P Protocol");

    /// @dev The EIP-712 domain version used for computing the domain separator.
    bytes32 internal constant DOMAIN_VERSION = keccak256("v2");

    function _signer(
        bytes32 _hash,
        bytes calldata _signature
    ) internal pure returns (address) {
        return ECDSA.recover(_hash, _signature);
    }

    function _harshOrder(
        IOrder.CreateOrder calldata _order
    ) internal returns (bytes32) {}

    function _domainSeparator() internal view returns (bytes32) {
        return EIP712.calculateDomainSeparator(DOMAIN_NAME, DOMAIN_VERSION);
    }
}
