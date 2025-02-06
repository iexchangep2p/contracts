// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IAML.sol";
import "../diamond/interfaces/IExchangeRoles.sol";
import "../libraries/LibAML.sol";

contract AML is IAML, IExchangeRoles {
    function addBlacklist(
        address _address
    ) external virtual override onlyAmlProvider {
        LibAML._add(_address, msg.sender);
    }

    function removeBlacklist(
        address _address
    ) external virtual override onlyAmlProvider {
        LibAML._remove(_address, msg.sender);
    }
}
