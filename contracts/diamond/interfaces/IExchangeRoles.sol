// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@solidstate/contracts/access/access_control/AccessControlInternal.sol";
abstract contract IExchangeRoles is AccessControlInternal {
    bytes32 internal constant IEXCHANGE_MANAGER =
        keccak256("IEXCHANGE_MANAGER");
    bytes32 internal constant AML_PROVIDER = keccak256("AML_PROVIDER");
    bytes32 internal constant KYC_PROVIDER = keccak256("KYC_PROVIDER");
    bytes32 internal constant SETTLER = keccak256("SETTLER");

    modifier onlyAdmin() {
        _checkRole(AccessControlStorage.DEFAULT_ADMIN_ROLE);
        _;
    }

    modifier onlyIExchangeManager() {
        _checkRole(IEXCHANGE_MANAGER);
        _;
    }

    modifier onlyAmlProvider() {
        _checkRole(AML_PROVIDER);
        _;
    }

    modifier onlyKycProvider() {
        _checkRole(KYC_PROVIDER);
        _;
    }

    modifier onlySettler() {
        _checkRole(SETTLER);
        _;
    }
}
