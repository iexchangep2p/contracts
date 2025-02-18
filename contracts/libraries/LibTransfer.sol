// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/ICrossChainSender.sol";
import "../globals/Errors.sol";
import "./LibData.sol";
import "./Helpers.sol";

library LibTransfer {
    function _send(address _token, uint256 _amount, address _to) internal {
        uint256 balanceBefore = IERC20(_token).balanceOf(address(this));
        SafeERC20.safeTransfer(IERC20(_token), _to, _amount);
        uint256 balanceAfter = IERC20(_token).balanceOf(address(this));
        if ((balanceBefore - balanceAfter) != _amount) {
            revert ProtocolInvariantCheckFailed();
        }
    }

    function _receive(address _token, uint256 _amount, address _from) internal {
        uint256 balanceBefore = IERC20(_token).balanceOf(address(this));
        SafeERC20.safeTransferFrom(
            IERC20(_token),
            _from,
            address(this),
            _amount
        );
        uint256 balanceAfter = IERC20(_token).balanceOf(address(this));
        if ((balanceAfter - balanceBefore) != _amount) {
            revert ProtocolInvariantCheckFailed();
        }
    }

    function _supportsChain(
        address _token,
        uint256 _chainId
    ) internal returns (bool) {
        TradeToken storage t = OrderStorage.load().tradeToken[_token];
        ICrossChainSender handler = ICrossChainSender(t.crossChainSender);
        (bool success, bytes memory result) = address(handler).delegatecall(
            abi.encodeWithSelector(
                ICrossChainSender.supportsChain.selector,
                _token,
                _chainId
            )
        );
        if (!success) {
            revert DelegateCallFailed("LibTransfer._supportsChain");
        }
        return abi.decode(result, (bool));
    }

    function _bridgeSend(
        address _token,
        uint256 _amount,
        address _to,
        uint256 _chainId
    ) internal {
        TradeToken storage t = OrderStorage.load().tradeToken[_token];
        ICrossChainSender handler = ICrossChainSender(t.crossChainSender);
        (bool success, ) = address(handler).delegatecall(
            abi.encodeWithSelector(
                ICrossChainSender.send.selector,
                _token,
                _amount,
                _to,
                _chainId
            )
        );
        if (!success) {
            revert DelegateCallFailed("LibTransfer._bridgeSend");
        }
    }

    function _crossChainSend(
        address _token,
        uint256 _amount,
        address _to,
        uint256 _chainId
    ) internal {
        if (block.chainid == _chainId) {
            _send(_token, _amount, _to);
        } else {
            _bridgeSend(_token, _amount, _to, _chainId);
        }
    }
}
