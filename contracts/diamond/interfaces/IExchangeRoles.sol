// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@solidstate/contracts/access/access_control/AccessControlInternal.sol";
abstract contract IExchangeRoles is AccessControlInternal {
    bytes32 internal constant IEXCHANGE_MANAGER =
        keccak256("IEXCHANGE_MANAGER");
    bytes32 internal constant SETTLER = keccak256("SETTLER");

    modifier onlyAdmin() {
        _checkRole(AccessControlStorage.DEFAULT_ADMIN_ROLE);
        _;
    }

    modifier onlyIExchangeManager() {
        _checkRole(IEXCHANGE_MANAGER);
        _;
    }

    modifier onlySettler() {
        _checkRole(SETTLER);
        _;
    }
}
