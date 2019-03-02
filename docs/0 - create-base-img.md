## Creating the raspbian image with necessary dependencies

##### on sd card

1. download raspbian lite zip https://www.raspberrypi.org/downloads/raspbian/
2. write to sd card with etcher
3. add empty [ssh] (resources/ssh)
    - add to boot (may have to eject/insert again, use disk utility)
4. create [wpa_supplicant.conf](resources/wpa_supplicant.conf)
    - add to boot, enter wifi details (see resources) and place into boot directory. This will be copied over on launch. This is needed to connect via ssh for customer setup

##### on raspberry pi (w/ sd card)

5. eject sd card, insert card into pi, attach to computer via usb
5. change password
    - `passwd`
6. setup ssh computer to pi - https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md
   - `ssh-keygen`
   - `ssh-copy-id pi@raspberrypi.local`
7. install node LTS (10.15), to run app
   - `wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.lts.sh | bash`
<!-- 8. install yarn (1.13.0), faster dependency installs than npm
   - `curl -o- -L https://yarnpkg.com/install.sh | bash` -->
7. install aws cli
    - `sudo apt-get update`
    - `sudo apt-get install awscli`
8. add env vars
9. add app startup/sync script

- `sudo vim.tiny /etc/systemd/system/antenna.service`
- input [antenna.service](resources/antenna.service) contents
- need to pull first to get rsa fingerprint
- test service: `sudo systemctl restart antenna`
- enable at startup: `sudo systemctl enable antenna`
- `systemctl status antenna.service`

resources:

- raspberry pi init https://medium.com/@jay_proulx/headless-raspberry-pi-zero-w-setup-with-ssh-and-wi-fi-8ddd8c4d2742
- download nodejs https://github.com/sdesalas/node-pi-zero
- systemd processes https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units
- systemd https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files

?'s
startup script
restart on a schedule?
