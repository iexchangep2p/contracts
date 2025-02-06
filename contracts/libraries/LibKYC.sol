// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IKYC.sol";
import "../diamond/interfaces/IExchangeRoles.sol";
import "../libraries/LibData.sol";

library LibKYC {
    function _upgrade(
        address _address,
        IKYC.KYCLevel _level,
        address _for
    ) internal {
        KYCStore storage kcs = KYCStorage.load();
        if (_level <= kcs.kyc[_address]) {
            revert IKYC.InvalidUpgrade();
        }
        kcs.kyc[_address] = _level;
        emit IKYC.KYCLevelUpgraded(_address, _for, _level);
    }

    function _downgrade(
        address _address,
        IKYC.KYCLevel _level,
        address _for
    ) internal {
        KYCStore storage kcs = KYCStorage.load();
        if (_level >= kcs.kyc[_address]) {
            revert IKYC.InvalidDowngrade();
        }
        kcs.kyc[_address] = _level;
        emit IKYC.KYCLevelDowngraded(_address, _for, _level);
    }

    function _get(address _address) internal view returns (IKYC.KYCLevel) {
        return KYCStorage.load().kyc[_address];
    }
}
