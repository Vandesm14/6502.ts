/*
 *   This file is part of 6502.ts, an emulator for 6502 based systems built
 *   in Typescript.
 *
 *   Copyright (C) 2016  Christian Speckner & contributors
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this program; if not, write to the Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {Action} from 'redux';

import {GuiMode} from '../../model/types';
import {
    batch,
    deleteCurrentCartridge,
    registerNewCartridge,
    saveCurrentCartride
} from '../../actions/root';
import {
    start as startEmulation
} from '../../actions/emulation';
import {
    loadOpenPendingChangesModal,
    setMode,
} from '../../actions/guiState';
import Cartridge from '../../model/Cartridge';
import CartridgeControlsComponent from '../../components/cartridge_manager/CartridgeControls';
import State from '../../state/State';

function mapStateToProps(state: State): CartridgeControlsComponent.Props {
    return {
        active: !!state.currentCartridge,
        changes: !!state.currentCartridge &&
            !Cartridge.equals(state.currentCartridge, state.cartridges[state.currentCartridge.hash])
    };
}

// tslint:disable-next-line:variable-name
const CartridgeControlsContainer = connect(
    mapStateToProps,
    {
        onDelete: deleteCurrentCartridge,
        onRun: () => batch(
            saveCurrentCartride(),
            setMode(GuiMode.run),
            startEmulation(),
            push('/emulation')
        ),
        onSave: saveCurrentCartride,
        onCartridgeUploaded: (file, changes) =>
            (dispatch: (a: Action) => void) => {
                const reader = new FileReader();

                reader.addEventListener('load', () => {
                    dispatch(changes ?
                        loadOpenPendingChangesModal(reader.result, file.name) :
                        registerNewCartridge(file.name, new Uint8Array(reader.result))
                    );
                });

                reader.readAsArrayBuffer(file);
            }
    }
)(CartridgeControlsComponent);

export default CartridgeControlsContainer;
