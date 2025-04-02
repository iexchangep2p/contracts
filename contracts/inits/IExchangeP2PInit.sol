// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../libraries/LibData.sol";
contract IExchangeP2PInit {
    function init() external {
        OrderStore storage ods = OrderStorage.load();
        ods.minPaymentTimeLimit = 15 minutes;
        ods.maxPaymentTimeLimit = 6 hours;
    }
}
