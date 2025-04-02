// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICrossChainSender {
    function send(
        address _token,
        uint256 _amount,
        address _to,
        uint256 _chainId
    ) external;

}
