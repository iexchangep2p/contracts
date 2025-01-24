// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../globals/Types.sol";

abstract contract IMerchant {
    struct Merchant {
        bool active;
        address owner;
        StakeToken stakeToken;
    }

    event MerchantStaked(address merchant, address token, uint256 amount);
    event MerchantUnstaked(address merchant, address token, uint256 amount);

    /**
     * @notice  merchant staking
     * @dev     must ensure token is accepted for staking
     * @param   _token  token used for staking
     */
    function stake(address _token) external virtual;
    /**
     * @notice  merchant unstaking
     * @dev     .
     * @param   _token  toeken to unstake from
     */
    function unstake(address _token) external virtual;
    /**
     * @notice  merchant can add addresses to their account and it will be recognized as theirs.
     * @dev     new address is pointed to the original address as the owner
     * @param   _addr  .
     */
    function addAddress(address _addr) external virtual;
    /**
     * @notice  remove and added address.
     * @dev     .
     * @param   _addr  .
     */
    function removeAddress(address _addr) external virtual;
}
