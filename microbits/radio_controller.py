# Add your Python code here. E.g.
from microbit import *
import radio
radio.on()
radio.config(channel=43)

button = 0

while True:
    if button_a.is_pressed():
        display.show(Image.SKULL)
        button = 1
    else:
        button = 0
    if button == 1:
        radio.send('Helloo')
    if button_b.is_pressed():
        display.show(Image.HEART)
        button = 2
    else:
        button = 0
    if button == 2:
        radio.send('Yellow')