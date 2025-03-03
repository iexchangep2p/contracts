// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenMultiSend {
    event Distributed(
        address distributor,
        address benefactor,
        address token,
        uint256 amount
    );

    function send(
        address[] calldata _tokens,
        uint256 _val,
        address _to
    ) external {
        for (uint i = 0; i < _tokens.length; i++) {
            SafeERC20.safeTransferFrom(
                IERC20(_tokens[i]),
                msg.sender,
                _to,
                _val
            );
            emit Distributed(msg.sender, _to, _tokens[i], _val);
        }
    }
}
