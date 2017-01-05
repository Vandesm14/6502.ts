	processor 6502
	include ../vcs.h

	SEG.U VARS
	ORG $80

	SEG CODE
	org $F000

HRULE_COLOR = $78
VRULE_COLOR = $04
PLAYER_COLOR = $2A
PLAYER_BITMAP = $80

    MAC DRAW

.WAIT SET 0

    REPEAT 67

		STY COLUBK

.CYCLES SET .WAIT

            IF .CYCLES & 1
                BIT VSYNC
.CYCLES SET .CYCLES - 3
            ENDIF

            REPEAT .CYCLES / 2
                NOP
            REPEND

        STA RESP0
		LDY #$0
        STA WSYNC
		STY COLUBK
        STA WSYNC
		STY COLUBK
		LDY #HRULE_COLOR
        STA WSYNC

.WAIT SET .WAIT + 1

    REPEND

    ENDM

Start
	SEI
	CLD
	LDX #$FF
	TXS
	LDA #0
ClearMem
	STA 0,X
	DEX
	BNE ClearMem

	LDA #%10100000
	STA PF0
	LDA #%01010101
	STA PF1
	LDA #%10101010
	STA PF2

    LDA #$00
    STA NUSIZ0

    LDA #PLAYER_COLOR
	STA COLUP0

MainLoop

Vsync
	; line 1
	LDA #2
	STA VSYNC
    STA VBLANK
	STA WSYNC

	; line 2
	STA WSYNC

	; line 3
	STA WSYNC

Vblank
	LDA  #47
	STA  TIM64T
	LDA #0
	STA  VSYNC

	LDA #PLAYER_BITMAP
	STA GRP0
	LDA #VRULE_COLOR
	STA COLUPF
	LDY #HRULE_COLOR

BurnVblank
	LDA INTIM
	BNE BurnVblank

    LDA #0
    STA VBLANK

	STA WSYNC
	STA WSYNC

Kernal

    DRAW

	LDA 0
	STA GRP0
	STA COLUPF
	STA COLUBK
	LDA #2
	STA VBLANK
    LDX #67

BurnOverscan
	STA WSYNC
	DEX
	BNE BurnOverscan

	JMP  MainLoop

	org $FFFC
	.word Start
	.word Start
