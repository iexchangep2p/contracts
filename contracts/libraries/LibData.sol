// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IExchangeP2P.sol";

struct OrderStore {
    mapping(uint256 => IExchangeP2P.Order) orders;
    uint256 orderId;
    address merchantStakeToken; // address
    uint256 merchantStakeAmount; // usdc amount to stake to become a merchant
    uint256 concurrentMerchantSettlements; // # of concurrent transactions a merchant is allowed to handle
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
    mapping(uint256 => IExchangeP2P.Appeal) appeals;
    uint256 appealId;
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
    mapping(address => IExchangeP2P.KYCLevel) kyc;
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
    mapping(address => IExchangeP2P.Blacklist) blacklist;
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
