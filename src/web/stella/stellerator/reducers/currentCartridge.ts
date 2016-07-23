import {Action} from 'redux';

import {
    Type as ActionType,
    ChangeCartridgeTypeAction,
    ChangeNameAction,
    ChangeTvModeAction
} from '../actions/currentCartridge';

import Cartridge from '../state/Cartridge';

export default function reduce(state: Cartridge, action: Action): Cartridge {
    switch (action.type) {
        case ActionType.changeCartridgeType:
            return changeCartridgeType(state, action as ChangeCartridgeTypeAction);

        case ActionType.changeName:
            return changeName(state, action as ChangeNameAction);

        case ActionType.changeTvMode:
            return changeTvMode(state, action as ChangeTvModeAction);

        default:
            return state;
    }
}

function changeName(state: Cartridge = new Cartridge(), action: ChangeNameAction): Cartridge {
    return new Cartridge({name: action.name}, state);
}

function changeTvMode(state: Cartridge = new Cartridge(), action: ChangeTvModeAction): Cartridge {
    return new Cartridge({tvMode: action.tvMode}, state);
}

function changeCartridgeType(state: Cartridge = new Cartridge(), action: ChangeCartridgeTypeAction): Cartridge {
    return new Cartridge({cartridgeType: action.cartridgeType}, state);
}
