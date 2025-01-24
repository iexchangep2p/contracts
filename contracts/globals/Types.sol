// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct StakeToken {
    address token;
    uint256 stakeAmount;
}
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
struct MoneyConfig {
    bool active;
    uint256 buyLimit;
    uint256 sellLimit;
}