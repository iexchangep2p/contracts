// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/LibData.sol";

library LibAppeal {
    function _get(bytes32 _orderHash) internal view returns (IAppeal.Appeal memory) {
        return AppealStorage.load().appeals[_orderHash];
    }
}
