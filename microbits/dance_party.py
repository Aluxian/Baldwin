from microbit import *
import music
import radio
radio.on()
radio.config(channel=43)

is_playing = False

while True:
    try:
        info = str(radio.receive())
        if info == "Music_On":
            if not is_playing:
                music.play(music.NYAN, wait=False)
        if info == "Music_Off":
            if is_playing:
                music.stop()
        display.show(Image.MUSIC_QUAVERS)
    except ValueError:
        sleep(0.1)
    