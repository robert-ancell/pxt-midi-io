//% weight=0 icon="\uf001" color="#5ea9dd" block="MIDI"
namespace midi {
    let initialized = false

    let onNoteOffHandler: (channel: number, key: number, velocity: number) => void
    let onNoteOnHandler: (channel: number, key: number, velocity: number) => void
    let onProgramChangeHandler: (channel: number, program: number) => void
    let onChannelPressureHandler: (channel: number, pressure: number) => void
    let onPitchBendHandler: (channel: number, bend: number) => void
    let onStartHandler: () => void
    let onContinueHandler: () => void
    let onStopHandler: () => void

    function processSystemMessage(type: number) {
       switch (type) {
       case 10:
           if (onStartHandler)
               onStartHandler()
           break
       case 11:
           if (onContinueHandler)
               onContinueHandler()
           break
       case 12:
           if (onStopHandler)
               onStopHandler()
           break
        }
    }

    function processMessage(type: number, channel: number) {
       switch (type) {
       case 0:
           data = serial.readBuffer(2)
           if (onNoteOffHandler)
               onNoteOffHandler(channel, data[0], data[1])
           break
       case 1:
           data = serial.readBuffer(2)
           if (onNoteOnHandler)
               onNoteOnHandler(channel, data[0], data[1])
           break
       case 4:
           data = serial.readBuffer(1)
           if (onProgramChangeHandler)
               onProgramChangeHandler(channel, data[0])
           break
       case 5:
           data = serial.readBuffer(1)
           if (onChannelPressureHandler)
               onChannelPressureHandler(channel, data[0])
           break
       case 6:
           data = serial.readBuffer(2)
           if (onPitchBendHandler)
               onPitchBendHandler(channel, ((data[1] << 7) | data[0]) - 8192)
           break
       case 7:
           processSystemMessage(channel);
           break
       }
    }

    function init() {
        if (initialized) return
        initialized = true
        serial.redirect(SerialPin.P0, SerialPin.P1, BaudRate.BaudRate31250)
        basic.forever (function () {
           let data = serial.readBuffer(1)
           if (data.length == 0) return

           /// Commands have first bit set, skip other values
           let command = data[0]
           if ((command & 0b10000000) == 0) return
           let type = (command & 0b01110000) >> 4
           let channel = command & 0b00001111

           processMessage(type, channel);
        })
    }

    /**
    * Registers code to run when a note off MIDI event is received.
    */
    //% block="on note off" draggableParameters="reporter"
    export function onNoteOff(cb: (channel: number, key: number, velocity: number) => void) {
        init()
        onNoteOffHandler = cb
    }

    /**
    * Registers code to run when a note on MIDI event is received.
    */
    //% block="on note on" draggableParameters="reporter"
    export function onNoteOn(cb: (channel: number, key: number, velocity: number) => void) {
        init()
        onNoteOnHandler = cb
    }

    /**
    * Registers code to run when a program change MIDI event is received.
    */
    //% block="on program change" draggableParameters="reporter"
    export function onProgramChange(cb: (channel: number, program: number) => void) {
        init()
        onProgramChangeHandler = cb
    }

    /**
    * Registers code to run when a channel pressure MIDI event is received.
    */
    //% block="on channel pressure" draggableParameters="reporter"
    export function onChannelPressure(cb: (channel: number, pressure: number) => void) {
        init()
        onChannelPressureHandler = cb
    }

    /**
    * Registers code to run when a pitch bend MIDI event is received.
    */
    //% block="on pitch bend" draggableParameters="reporter"
    export function onPitchBend(cb: (channel: number, bend: number) => void) {
        init()
        onPitchBendHandler = cb
    }

    /**
    * Registers code to run when a start MIDI event is received.
    */
    //% block="on start"
    export function onStart(cb: () => void) {
        init()
        onStartHandler = cb
    }

    /**
    * Registers code to run when a continue MIDI event is received.
    */
    //% block="on continue"
    export function onContinue(cb: () => void) {
        init()
        onContinueHandler = cb
    }

    /**
    * Registers code to run when a stop MIDI event is received.
    */
    //% block="on stop"
    export function onStop(cb: () => void) {
        init()
        onStopHandler = cb
    }
}
