# Add your Python code here. E.g.
from microbit import *
import radio
radio.on()
radio.config(channel=43)

p0_state = 0 # fan
p1_state = 0 # buzzer

while True:
    try:
        info = radio.receive()

        if info == "Fan_On":
            display.show(Image.DUCK)
            p0_state = 1
        if info == "Fan_Off":
            display.show(Image.RABBIT)
            p0_state = 0

        if info == "Buzzer_On":
            display.show(Image.XMAS)
            p1_state = 1
        if info == "Buzzer_Off":
            display.show(Image.COW)
            p1_state = 0

        pin0.write_digital(p0_state)
        pin1.write_digital(p1_state)
    except ValueError:
        sleep(0.1)
