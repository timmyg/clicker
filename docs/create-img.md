# Creating the raspbian image

1. download raspbian lite zip https://www.raspberrypi.org/downloads/raspbian/
2. write to sd card with etcher
3. add empty [ssh](resources/ssh) file to boot (may have to eject/insert again, use disk utility)
4. create [wpa_supplicant.conf](resources/wpa_supplicant.conf), enter wifi details (see resources) and place into boot directory. This will be copied over on launch
5. eject sd card, insert card into pi, attach to computer via usb
6. setup ssh computer to pi - https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md
    - ssh-keygen
    - ssh-copy-id pi@raspberrypi.local
7. setup ssh pi to github  - https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/
    - ssh-keygen
    - add public key to github
8. install node LTS (10.15)
   - `wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.lts.sh | bash`
9. install yarn (1.13.0)
   - `curl -o- -L https://yarnpkg.com/install.sh | bash`
10. install git (2.11)
   - `sudo apt-get install git`
11. add app startup/sync script
    - sudo vi /etc/systemd/system/clicker.service
    - input [clicker.service](resources/clicker.service) contents
    - need to pull first to get rsa fingerprint
    - start service: `sudo systemctl start clicker`
    - enable at startup: `sudo systemctl enable clicker`


resources:

- raspberry pi init https://medium.com/@jay_proulx/headless-raspberry-pi-zero-w-setup-with-ssh-and-wi-fi-8ddd8c4d2742
- download nodejs https://github.com/sdesalas/node-pi-zero
- systemd processes https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units
- systemd https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files

?'s
startup script
better way of pulling code?
really bad to pull github repo?