1. download latest raspberry pi os and flash to sd card (w/ sd card reader) via etcher
2. add ssh and wpa_supplicant to /boot
3. insert sd card into raspberry pi, connect via usb
   - `ssh pi@raspberrypi.local`
4. do clicker specific tasks:
   - change passwd
   - install node, etc. via `setup.sh` script
5. remove wpa_supplicant
6. `sudo ./image-backup`

   - be sure to chmod first
   - image-backup from RonR-RaspberryPi-image-utils
   - /media/raspos-antenna-20200709-build2.img

7. `scp pi@raspberrypi.local:/media/raspos-antenna-20200709.img ~/Desktop`

# todo

- [x] download img via curl, remove aws dependency
