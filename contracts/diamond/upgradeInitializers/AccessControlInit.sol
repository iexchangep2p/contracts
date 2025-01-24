// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@solidstate/contracts/access/access_control/AccessControlInternal.sol";
import "@solidstate/contracts/access/access_control/AccessControlStorage.sol";
import "../interfaces/IExchangeRoles.sol";

contract AccessControlInit is AccessControlInternal, IExchangeRoles {
    function init() external {
        _grantRole(AccessControlStorage.DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(IEXCHANGE_MANAGER, msg.sender);
        _grantRole(AML_PROVIDER, msg.sender);
        _grantRole(KYC_PROVIDER, msg.sender);
        _grantRole(SETTLER, msg.sender);
    }
}
