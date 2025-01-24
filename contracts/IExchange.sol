// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./diamond/Diamond.sol";

contract IExchange is Diamond {

    constructor(
        address _contractOwner,
        address _diamondCutFacet
    ) payable Diamond(_contractOwner, _diamondCutFacet) {}
}
