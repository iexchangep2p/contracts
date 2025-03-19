// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../interfaces/ICrossChainSender.sol";
import "../../libraries/LibTransfer.sol";
import "../../diamond/interfaces/IExchangeRoles.sol";

struct AccrossStore {
    mapping(address => mapping(uint256 => bool)) supported;
}

library AccrossStorage {
    bytes32 constant AML_STORAGE_POSITION =
        keccak256("iexchange.global.sender.accross");

    function load() internal pure returns (AccrossStore storage s) {
        bytes32 position = AML_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

contract AccrossSender is ICrossChainSender, IExchangeRoles {
    function send(
        address _token,
        uint256 _amount,
        address _to,
        uint256 _chainId
    ) external {
        if (!supportsChain(_token, _chainId)) {
            revert CrossChainUnsupported();
        }
        LibTransfer._send(_token, _amount, _to);
    }

    function supportsChain(
        address _token,
        uint256 _chainId
    ) public view override returns (bool) {
        return AccrossStorage.load().supported[_token][_chainId];
    }

    function addSupport(
        address _token,
        uint256[] calldata _chainIds
    ) external override {
        for (uint i = 0; i < _chainIds.length; i++) {
            AccrossStorage.load().supported[_token][_chainIds[i]] = true;
        }
    }

    function removeSupport(
        address _token,
        uint256[] calldata _chainIds
    ) external override {
        for (uint i = 0; i < _chainIds.length; i++) {
            AccrossStorage.load().supported[_token][_chainIds[i]] = false;
        }
    }
}
