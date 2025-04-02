// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum OrderState {
    pending,
    accepted,
    paid,
    appealed,
    released,
    cancelled
}
enum OrderType {
    buy,
    sell
}

struct TradeToken {
    bool active;
    uint256 collectedFees;
    address crossChainSender;
    uint256 orderFee;
}