//% weight=0 icon="\uf001" color="#5ea9dd" block="MIDI"
namespace midi {
    var onNoteOff = null
    var onNoteOn = null

    /**
    * setup MIDI
    */
    //% block="setup MIDI"
    export function initMidi () {
        serial.redirect(SerialPin.P0, SerialPin.P1, BaudRate.BaudRate31250)
        basic.forever (function () {
           let data = serial.readBuffer(1)
           if (data.length == 0) {
               return
           }

           /// Commands have first bit set, skip other values
           let command = data[0]
           if (command & 0b1000000 == 0) {
               return
           }
           let type = (command & 0x0b01110000) >> 4
           let channel = command & 0b00001111

           switch (type) {
           case 0:
               data = serial.readBuffer(2)
               if (onNoteOff != null) {
                   onNoteOff(channel, data[0], data[1])
               }
               break
           case 1:
               data = serial.readBuffer(2)
               if (onNoteOn != null) {
                   onNoteOn(channel, data[0], data[1])
               }
               break
           default:
               return
           }
        })
    }

    /**
    * Registers code to run when a note off MIDI event is received.
    */
    //% block="on note off"
    export function onMidiNoteOffEvent (cb: (channel: number, key: number, velocity: number) => void) {
        onNoteOff = cb
    }

    /**
    * Registers code to run when a note on MIDI event is received.
    */
    //% block="on note on"
    export function onMidiNoteOnEvent (cb: (channel: number, key: number, velocity: number) => void) {
        onNoteOn = cb
    }
}
