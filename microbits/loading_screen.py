from microbit import *

start = Image("00000:000000:00900:00000:00000")
nd_r = Image("00000:00900:09090:00900:00000")
rd_r = Image("00900:09090:90009:09090:00900")
th_r = Image("09090:90009:00000:90009:09090")
final = Image("90009:00000:00000:00000:90009")

while True:
    display.show(start)
    sleep(150)
    display.show(nd_r)
    sleep(150)
    display.show(rd_r)
    sleep(150)
    display.show(th_r)
    sleep(150)
    display.show(rd_r)
    sleep(150)
    display.show(nd_r)
    sleep(150)