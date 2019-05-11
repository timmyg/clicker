## Creating the raspbian image with necessary dependencies

##### on sd card

1. download raspbian lite zip https://www.raspberrypi.org/downloads/raspbian/
2. write to sd card with etcher
3. add empty [ssh](resources/ssh)
   - add to boot (may have to eject/insert again, use disk utility)
4. create [wpa_supplicant.conf](resources/wpa_supplicant.conf)
   - add to boot, enter wifi details (see resources) and place into boot directory. This will be copied over on launch. This is needed to connect via ssh for customer setup

##### on raspberry pi (w/ sd card)

5. eject sd card, insert card into pi, attach to computer via usb
6. change password
   - `ssh pi@raspberrypi.local`
   - `passwd`
7. setup ssh computer to pi - https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md
   <!-- - `ssh-keygen` -->
   - `ssh-copy-id pi@raspberrypi.local`
8. install node LTS (10.15), to run app
   - `wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.lts.sh | bash`
9. install aws cli
   - `sudo apt-get update && sudo apt-get install awscli`
     <!-- 10. add env vars

- `scp .env pi@raspberrypi.local:` -->

11. add app startup/sync script

- `sudo vim.tiny /etc/systemd/system/copy-env-vars.service`
- `sudo vim.tiny /etc/systemd/system/antenna.service`
- input [copy-env-vars.service](resources/copy-env-vars.service) contents
- input [antenna.service](resources/antenna.service) contents
- test service: `sudo systemctl daemon-reload && sudo systemctl restart antenna`
- enable at startup: `sudo systemctl enable antenna`
- logging debugging: `systemctl status antenna.service`
  `journalctl -xe`

12. burn image

- `sudo dd if=/dev/rdisk2 | gzip > ~/Desktop/clicker-img-v0.2.0-dd.gz`
  or diskutil

resources:

- raspberry pi init https://medium.com/@jay_proulx/headless-raspberry-pi-zero-w-setup-with-ssh-and-wi-fi-8ddd8c4d2742
- download nodejs https://github.com/sdesalas/node-pi-zero
- systemd processes https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units
- systemd https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files

?'s
startup script
restart on a schedule?
