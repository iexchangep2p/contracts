// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/IMerchant.sol";
import "../libraries/LibMerchant.sol";

contract Merchant is IMerchant {
    function stake(address _token) external virtual override {
        LibMerchant._stake(_token, msg.sender);
    }

    function unstake(address _token) external virtual override {
        LibMerchant._unstake(_token, msg.sender);
    }

    function addAddress(address _addr) external virtual override {
        LibMerchant._addAddress(_addr, msg.sender);
    }

    function removeAddress(address _addr) external virtual override {
        LibMerchant._removeAddress(_addr, msg.sender);
    }
}
