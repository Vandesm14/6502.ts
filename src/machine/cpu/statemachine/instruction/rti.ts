/*
 *   This file is part of 6502.ts, an emulator for 6502 based systems built
 *   in Typescript.
 *
 *   Copyright (C) 2014 - 2018 Christian Speckner & contributors
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

import StateMachineInterface from '../StateMachineInterface';
import CpuInterface from '../../CpuInterface';
import ResultImpl from '../ResultImpl';
import { freezeImmutables, Immutable } from '../../../../tools/decorators';

class Rti implements StateMachineInterface {
    constructor(state: CpuInterface.State) {
        this._state = state;

        freezeImmutables(this);
    }

    @Immutable reset = (): StateMachineInterface.Result => this._result.read(this._dummyOperandRead, this._state.p);

    @Immutable
    private _dummyOperandRead = (): StateMachineInterface.Result =>
        this._result.read(this._dummyStackRead, 0x0100 + this._state.s);

    @Immutable
    private _dummyStackRead = (): StateMachineInterface.Result => {
        this._state.s = (this._state.s + 1) & 0xff;

        return this._result.read(this._popP, 0x0100 + this._state.s);
    };

    @Immutable
    private _popP = (value: number): StateMachineInterface.Result => {
        this._state.flags = (value | CpuInterface.Flags.e) & ~CpuInterface.Flags.b;
        this._state.s = (this._state.s + 1) & 0xff;

        return this._result.read(this._popPcl, 0x0100 + this._state.s);
    };

    @Immutable
    private _popPcl = (value: number): StateMachineInterface.Result => {
        this._state.p = (this._state.p & 0xff00) | value;
        this._state.s = (this._state.s + 1) & 0xff;

        return this._result.read(this._popPch, 0x0100 + this._state.s);
    };

    @Immutable
    private _popPch = (value: number): null => {
        this._state.p = (this._state.p & 0xff) | (value << 8);

        return null;
    };

    @Immutable private readonly _result = new ResultImpl();

    @Immutable private readonly _state: CpuInterface.State;
}

export const rti = (state: CpuInterface.State) => new Rti(state);
