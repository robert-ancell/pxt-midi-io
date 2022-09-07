//% weight=0 icon="\uf001" color="#5ea9dd" block="MIDI"
namespace midi {
    let initialized = false

    let onNoteOffHandler: (channel: number, key: number, velocity: number) => void
    let onNoteOnHandler: (channel: number, key: number, velocity: number) => void

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
           default:
               return
           }
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
}
