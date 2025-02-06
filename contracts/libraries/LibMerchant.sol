// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./LibData.sol";
import "./LibTransfer.sol";

library LibMerchant {
    function _getMerchant(
        address _merchant
    ) internal view returns (IMerchant.Merchant storage) {
        OrderStore storage o = OrderStorage.load();
        if (!o.merchant[_merchant].active) {
            revert IMerchant.InactiveMerchant();
        }
        if (address(0) != o.merchant[_merchant].owner) {
            if (!o.merchant[o.merchant[_merchant].owner].active) {
                revert IMerchant.InactiveMerchant();
            }
            return o.merchant[o.merchant[_merchant].owner];
        }
        return o.merchant[_merchant];
    }
    function _get(
        address _merchant
    ) internal view returns (IMerchant.Merchant storage) {
        OrderStore storage o = OrderStorage.load();
        if (address(0) != o.merchant[_merchant].owner) {
            return o.merchant[o.merchant[_merchant].owner];
        }
        return o.merchant[_merchant];
    }
    function _validate(address _token, address _merchant) internal pure {
        if (address(0) == _token) {
            revert ZeroAddress();
        }
        if (address(0) == _merchant) {
            revert ZeroAddress();
        }
    }
    function _stake(address _token, address _merchant) internal {
        _validate(_token, _merchant);
        IMerchant.Merchant storage merchant = _get(_merchant);
        if (merchant.stakeToken.token != address(0)) {
            revert IMerchant.MerchantAlreadStaked();
        }
        OrderStore storage o = OrderStorage.load();
        if (o.stakeToken[_token].token != _token) {
            revert IMerchant.InvalidStakeToken();
        }
        merchant.active = true;
        merchant.stakeToken = StakeToken(
            _token,
            o.stakeToken[_token].stakeAmount
        );
        merchant.owner = address(0);
        merchant.concurrentOrders = 0;
        LibTransfer._receive(
            _token,
            o.stakeToken[_token].stakeAmount,
            _merchant
        );
        emit IMerchant.MerchantStaked(
            _merchant,
            _token,
            o.stakeToken[_token].stakeAmount
        );
    }
    function _unstake(address _token, address _merchant) internal {
        _validate(_token, _merchant);
        IMerchant.Merchant storage merchant = _getMerchant(_merchant);
        if (merchant.stakeToken.token != _token) {
            revert IMerchant.InvalidStakeToken();
        }
        if (merchant.concurrentOrders > 0) {
            revert IMerchant.MerchantHasActiveOrders();
        }
        OrderStore storage o = OrderStorage.load();
        uint256 stakeAmount = merchant.stakeToken.stakeAmount;
        delete o.merchant[_merchant];
        if (o.merchant[_merchant].owner != address(0)) {
            delete o.merchant[o.merchant[_merchant].owner];
        }
        LibTransfer._send(_token, stakeAmount, _merchant);
        emit IMerchant.MerchantUnstaked(_merchant, _token, stakeAmount);
    }
    function _addAddress(address _addr, address _merchant) internal {
        _validate(_addr, _merchant);
        OrderStore storage o = OrderStorage.load();
        if (o.merchant[_addr].active) {
            revert IMerchant.AddressAlreadyMerchant();
        }
        o.merchant[_addr] = IMerchant.Merchant({
            active: true,
            owner: _merchant,
            stakeToken: StakeToken(address(0), 0),
            concurrentOrders: 0
        });
        emit IMerchant.MerchantAddedAddress(_merchant, _addr);
    }
    function _removeAddress(address _addr, address _merchant) internal {
        _validate(_addr, _merchant);
        OrderStore storage o = OrderStorage.load();
        if (!o.merchant[_addr].active) {
            revert IMerchant.InactiveMerchant();
        }
        if (o.merchant[_addr].owner == _merchant) {
            delete o.merchant[_addr];
            emit IMerchant.MerchantRemovedAddress(_merchant, _addr);
        } else {
            revert IMerchant.MerchantNotAddressOwner();
        }
    }
}
