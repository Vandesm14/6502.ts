import AbstractCartridge from './AbstractCartridge';
import * as cartridgeUtil from './util';
import CartridgeInfo from './CartridgeInfo';

class CartrdigeE7 extends AbstractCartridge {

    constructor(buffer: cartridgeUtil.BufferInterface) {
        super();

        if (buffer.length !== 0x4000) {
            throw new Error(`buffer is not a 16k cartridge image: wrong length ${buffer.length}`);
        }

        for (let i = 0; i < 8; i++) {
            this._banks[i] = new Uint8Array(0x0800);
        }

        this._bank0 = this._banks[0];

        for (let i = 0; i < 4; i++) {
            this._ram1Banks[i] = new Uint8Array(0x100);
        }

        this._ram1 = this._ram1Banks[0];

        for (let i = 0; i < 0x0800; i++) {
            for (let j = 0; j < 8; j++) {
                this._banks[j][i] = buffer[j * 0x0800 + i];
            }
        }
    }

    read(address: number): number {
        address &= 0x0FFF;

        this._handleBankswitch(address);

        // 0 -> 0x07FF: bank 0 - 6 or RAM
        if (address < 0x0800) {
            // RAM enabled?
            if (this._ram0Enabled) {
                // 0x0000 - 0x03FF is write, 0x0400 - 0x07FF is read
                return address >= 0x0400 ? this._ram0[address - 0x0400] : 0;
            } else {
                //  bank 0 - 6
                return this._bank0[address];
            }
        }

        // 0x0800 -> 0x9FF is RAM
        if (address <= 0x09FF) {
            // 0x0800 - 0x08FF is write, 0x0900 - 0x09FF is read
            return address >= 0x0900 ? this._ram1[address - 0x0900] : 0;
        }

        // Higher address are the remaining 1.5k of bank 7
        return this._banks[7][0x07FF - (0x0FFF - address)];
    }

    write(address: number, value: number) {
        address &= 0x0FFF;

        this._handleBankswitch(address);

        if (address < 0x0400) {
            if (this._ram0Enabled) {
                this._ram0[address] = value;
            } else {
                super.write(address, value);
            }
        }
        else if (address < 0x0800) {
            super.write(address, value);
        }
        else if (address < 0x08FF) {
            this._ram1[address - 0x0800] = value;
        }
        else {
            super.write(address, value);
        }
    }

    private _handleBankswitch(address: number): void {
        if (address < 0x0FE0) {
            return;
        }

        if (address <= 0x0FE6) {
            this._bank0 = this._banks[address & 0x000F];
            this._ram0Enabled = false;
        }
        else if (address === 0x0FE7) {
            this._ram0Enabled = true;
        }
        else if (address <= 0x0FEB) {
            this._ram1 = this._ram1Banks[address - 0x0FE8];
        }
    }

    getType(): CartridgeInfo.CartridgeType {
        return CartridgeInfo.CartridgeType.bankswitch_16k_E7;
    }

    static matchesBuffer(buffer: cartridgeUtil.BufferInterface): boolean {
        // Signatures shamelessly stolen from stella
        const signatureCounts = cartridgeUtil.searchForSignatures(
            buffer,
            [
                [0xAD, 0xE2, 0xFF],  // LDA $FFE2
                [0xAD, 0xE5, 0xFF],  // LDA $FFE5
                [0xAD, 0xE5, 0x1F],  // LDA $1FE5
                [0xAD, 0xE7, 0x1F],  // LDA $1FE7
                [0x0C, 0xE7, 0x1F],  // NOP $1FE7
                [0x8D, 0xE7, 0xFF],  // STA $FFE7
                [0x8D, 0xE7, 0x1F]   // STA $1FE7
            ]
        );

        for (let i = 0; i < signatureCounts.length; i++) {
            if (signatureCounts[i] > 0) {
                return true;
            }
        }

        return false;
    }

    private _banks = new Array<Uint8Array>(8);
    private _bank0: Uint8Array;

    private _ram0 = new Uint8Array(0x0400);
    private _ram1Banks = new Array<Uint8Array>(4);
    private _ram1: Uint8Array;
    private _ram0Enabled = false;

}

export default CartrdigeE7;