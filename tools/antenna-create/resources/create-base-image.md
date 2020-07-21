create base raspberry os with antenna program

1. download latest raspberry pi os and flash to sd card (w/ sd card reader) via etcher
   - `sudo balena local flash ~/Downloads/2020-05-27-raspios-buster-lite-armhf.img --drive /dev/disk2 --yes`
2. add ssh and wpa_supplicant to /boot, eject
   - `cp resources/ssh resources/wpa_supplicant.conf /Volumes/boot && diskutil eject /dev/disk2`
3. insert sd card into raspberry pi, connect via usb
   - `ssh pi@raspberrypi.local`
4. do clicker specific tasks:

   - change passwd
     - `passwd`
   - install node (on pi)
     - `wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.lts.sh | bash`
   - copy services
     - (from local to pi) `scp ~/Code/clicker/tools/antenna-create/resources/services/{antenna,copy-env-vars,dataplicity}.service pi@raspberrypi.local:/tmp`
     - (on pi) `sudo mv /tmp/*.service /etc/systemd/system`
     - `sudo systemctl enable antenna && sudo systemctl enable dataplicity`

5. `sudo ./image-backup`

   - copy to pi `scp -r ~/Code/RonR-RaspberryPi-image-utils pi@raspberrypi.local:/tmp`
   - be sure to chmod first `chmod +x image-backup`
   - `sudo ./image-backup` from RonR-RaspberryPi-image-utils
   - name: /media/raspos-antenna-20200720-build1.img
   - defaults for rest
   - took about 10 mins

6. bring image to local
   - (from local) `scp pi@raspberrypi.local:/media/raspos-antenna-20200720-build1.img ~/Desktop`
