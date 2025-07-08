// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/LibData.sol";
import "../interfaces/IOrderBotSig.sol";
import "../globals/Errors.sol";

library LibBot {
    function _merchantBot(address _merchant) internal view returns (address) {
        BotStore storage b = BotStorage.load();
        if (b.merchantBot[_merchant] == address(0)) {
            revert IOrderBotSig.NoBotSet();
        }
        return b.merchantBot[_merchant];
    }

    function _setBot(address _merchant, address _bot) internal {
        BotStore storage b = BotStorage.load();
        b.merchantBot[_merchant] = _bot;
        emit IOrderBotSig.BotSet(_merchant, _bot);
    }
    function _removeBot(address _merchant) internal {
        BotStore storage b = BotStorage.load();
        address bot = b.merchantBot[_merchant];
        if (bot == address(0)) {
            revert IOrderBotSig.NoBotSet();
        }
        delete b.merchantBot[_merchant];
        emit IOrderBotSig.BotRemoved(_merchant, bot);
    }
}
