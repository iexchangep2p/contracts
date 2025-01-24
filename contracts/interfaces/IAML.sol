// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract IAML {
    struct Blacklist {
        bool _black;
        uint256 _addedAt;
    }

    error MinBlackListPeriodNotEnded(uint256 _timeToEnd);

    event BlacklistAdded(address _address, address _agent);
    event BlacklistRemoved(address _address, address _agent);

    function addBlacklist(address _address) external virtual;

    function removeBlacklist(address _address) external virtual;

    function isBlacklisted(
        address _address
    ) external view virtual returns (bool);
}
