// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./diamond/Diamond.sol";
import "./libraries/LibSig.sol";

contract IExchangeP2P is Diamond {
    bytes32 private constant DOMAIN_NAME = LibSig.DOMAIN_NAME;
    bytes32 private constant DOMAIN_VERSION = LibSig.DOMAIN_VERSION;
    bytes32 public immutable domainSeparator;

    constructor(
        address _contractOwner,
        address _diamondCutFacet
    ) payable Diamond(_contractOwner, _diamondCutFacet) {
        domainSeparator = LibSig._domainSeparator();
    }
}
