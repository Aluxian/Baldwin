# Add your Python code here. E.g.
from microbit import *
import radio
radio.on()
radio.config(channel=43)

def show_wave(last_wave):
    wave1 = Image("09000:90909:90909:90909:00090")
    wave2 = Image("90009:09090:09090:09090:00900")
    wave3 = Image("00090:90909:90909:90909:09000")
    wave4 = Image("00900:09090:09090:09090:90009")

    if last_wave == 1:
        display.show(wave2)
        sleep(250)
        return 2

    if last_wave == 2:
        display.show(wave3)
        sleep(250)
        return 3

    if last_wave == 3:
        display.show(wave4)
        sleep(250)
        return 4

    if last_wave == 4:
        display.show(wave1)
        sleep(250)
        return 1

    return 1

def show_circling(last_circling):
    state1 = Image("00000:00000:00900:00000:00000")
    state2 = Image("00000:00900:09090:00900:00000")
    state3 = Image("00900:09090:90009:09090:00900")
    state4 = Image("09090:90009:00000:90009:09090")
    state5 = Image("90009:00000:00000:00000:90009")

    if last_circling == 1:
        display.show(state2)
        sleep(150)
        return 2

    if last_circling == 2:
        display.show(state3)
        sleep(150)
        return 3

    if last_circling == 3:
        display.show(state4)
        sleep(150)
        return 4

    if last_circling == 4:
        display.show(state5)
        sleep(150)
        return 5

    if last_circling == 5:
        display.show(state4)
        sleep(150)
        return 6

    if last_circling == 6:
        display.show(state3)
        sleep(150)
        return 7

    if last_circling == 7:
        display.show(state2)
        sleep(150)
        return 8

    if last_circling == 8:
        display.show(state1)
        sleep(150)
        return 1
    
    return 1

def show_state(state, last_wave, last_circling):
    if "C" == state:
        last_wave = show_wave(last_wave)
    if "D" == state:
        display.scroll("nay")
    if "S" == state:
        display.show(Image.HAPPY)
    if "W" == state:
        display.show(Image.SURPRISED)
    if "H" == state:
        display.show(Image.HEART)
    if "P" == state:
        last_circling = show_circling(last_circling)
    if "F" == state:
        radio.send('Fan_On')
    if "G" == state:
        radio.send('Fan_Off')
    if "A" == state:
        radio.send('Buzzer_On')
    if "B" == state:
        radio.send('Buzzer_Off')
    if "M" == state:
        radio.send('Music_On')
    if "N" == state:
        radio.send('Music_Off')

    return (last_wave, last_circling)

state = 'S'
last = {}
last['wave'] = 4
last['circling'] = 1

while True:
    uart.init()
    lw, lc = show_state(state, last['wave'], last['circling'])
    last['wave'] = lw
    last['circling'] = lc
    if uart.any():
        state = str(uart.read(1))[2]