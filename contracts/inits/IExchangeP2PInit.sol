// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../libraries/LibData.sol";
contract IExchangeP2PInit {
    function init() external {
        OrderStore storage ods = OrderStorage.load();
        ods.maxConcurrentOrders = 100;
        ods.minPaymentTimeLimit = 15 minutes;
        ods.maxPaymentTimeLimit = 6 hours;
        AMLStore storage ams = AMLStorage.load();
        ams.minRemovePeriod = 24 hours;
    }
}
