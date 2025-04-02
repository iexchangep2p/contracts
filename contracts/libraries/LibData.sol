// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IExchange.sol";
import "../globals/Types.sol";

struct OrderStore {
    mapping(address => TradeToken) tradeToken; // currency bytes -> TradeToken
    mapping(address => IExchange.Merchant) merchant; // merchant address -> Merchant
    mapping(bytes32 => IExchange.Order) orders;
    uint256 minPaymentTimeLimit; // in minutes
    uint256 maxPaymentTimeLimit; // in minutes
}

library OrderStorage {
    bytes32 constant ORDER_STORAGE_POSITION =
        keccak256("iexchange.global.order");

    function load() internal pure returns (OrderStore storage s) {
        bytes32 position = ORDER_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

struct AppealStore {
    mapping(bytes32 => IExchange.Appeal) appeals;
}

library AppealStorage {
    bytes32 constant APPEAL_STORAGE_POSITION =
        keccak256("iexchange.global.appeal");

    function load() internal pure returns (AppealStore storage s) {
        bytes32 position = APPEAL_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
