// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract IXToken is ERC20, ERC20Permit {
    constructor() ERC20("IX Token", "IX") ERC20Permit("IX Token") {
        _mint(_msgSender(), 100_000_000 * 1e18);
    }
}