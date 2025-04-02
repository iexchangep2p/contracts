// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../interfaces/ICrossChainSender.sol";
import "../../libraries/LibTransfer.sol";

contract DummySender is ICrossChainSender {
    function send(
        address _token,
        uint256 _amount,
        address _to,
        uint256 /*_chainId*/
    ) external {
        LibTransfer._send(_token, _amount, _to);
    }
}
