// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IExchange.sol";
import "../globals/Types.sol";

struct OrderStore {
    mapping(address => StakeToken) stakeToken; // token address -> StakeToken
    mapping(bytes32 => MoneyConfig) paymentMethod; // payment method bytes -> MoneyConfig
    mapping(bytes32 => MoneyConfig) currency; // currency bytes -> MoneyConfig
    mapping(address => TradeToken) tradeToken; // currency bytes -> MoneyConfig
    mapping(address => IExchange.Merchant) merchant; // merchant address -> Merchant
    mapping(bytes32 => IExchange.Order) orders;
    uint256 orderId;
    uint256 maxConcurrentOrders; // # of concurrent transactions a merchant is allowed to handle
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

struct KYCStore {
    mapping(address => IExchange.KYCLevel) kyc;
}

library KYCStorage {
    bytes32 constant KYC_STORAGE_POSITION = keccak256("iexchange.global.kyc");

    function load() internal pure returns (KYCStore storage s) {
        bytes32 position = KYC_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

struct AMLStore {
    mapping(address => IExchange.Blacklist) blacklist;
    uint256 minRemovePeriod; // when address is added to a blacklist it can't be removed until after this period
}

library AMLStorage {
    bytes32 constant AML_STORAGE_POSITION = keccak256("iexchange.global.aml");

    function load() internal pure returns (AMLStore storage s) {
        bytes32 position = AML_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
