// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IAML.sol";
import "../libraries/LibData.sol";

library LibAML {
    function _add(address _address) internal {
        AMLStorage.load().blacklist[_address] = IAML.Blacklist(
            true,
            block.timestamp
        );
        emit IAML.BlacklistAdded(_address, msg.sender);
    }

    function _remove(address _address) internal {
        delete AMLStorage.load().blacklist[_address];
        emit IAML.BlacklistRemoved(_address, msg.sender);
    }

    function _is(address _address) internal view returns (bool) {
        return AMLStorage.load().blacklist[_address]._black;
    }
}
