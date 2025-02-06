// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IKYC {
    enum KYCLevel {
        level0,
        level1,
        level2,
        level3,
        level4
    }

    error InvalidKYCLevel(KYCLevel _level);
    error BlacklistedAddress(address _address);

    event KYCLevelUpgraded(address _address, address _agent, KYCLevel _level);
    event KYCLevelDowngraded(address _address, address _agent, KYCLevel _level);

    error InvalidUpgrade();
    error InvalidDowngrade();

    function upgradeKYCLevel(
        address _address,
        KYCLevel _level
    ) external virtual;

    function downgradeKYCLevel(
        address _address,
        KYCLevel _level
    ) external virtual;
}
