// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IKYC.sol";
import "../diamond/interfaces/IExchangeRoles.sol";
import "../libraries/LibKYC.sol";

contract KYC is IKYC, IExchangeRoles {
    function upgradeKYCLevel(
        address _address,
        KYCLevel _level
    ) external virtual override onlyKycProvider {
        LibKYC._upgrade(_address, _level);
    }

    function downgradeKYCLevel(
        address _address,
        KYCLevel _level
    ) external virtual override onlyKycProvider {
        LibKYC._downgrade(_address, _level);
    }

    function getKYCLevel(
        address _address
    ) external view virtual override returns (KYCLevel) {
        return LibKYC._get(_address);
    }
}
