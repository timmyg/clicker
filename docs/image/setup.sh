#!/bin/bash

# copy the following files into boot directory
#   - .env (customized for location)
#   - wpa_supplicant.conf (if necessary, customized)
#   - setup.sh (this file)
#   - ssh
#   - copy-env-vars.service
#   - antenna.service

# setup.sh  

echo "move copy-env-vars.service, antenna.service to /etc/systemd/system folder"
mv /boot/copy-env-vars.service /boot/antenna.service /etc/systemd/system
echo "done"

echo "move .env"
mv /boot/.env /home/pi
echo "done"

echo "move .pwd"
mv /boot/.pwd /home/pi
echo "done"

echo "changing password"
echo "pi:$(cat /home/pi/.pwd)" | sudo chpasswd
echo "done"

echo "install nodejs"
wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.lts.sh | bash
echo "done"

echo "install aws cli"
sudo apt-get update && sudo apt-get -y install awscli
echo "done"

echo "init antenna service" # (which calls copy-env-vars service)
sudo systemctl enable antenna
echo "done"

echo "creating complete file"
sudo echo "complete! $(date '+%d/%m/%Y %H:%M:%S')" > /boot/setup-complete.txt
echo "done"

echo "TODO pitunnel if wanted!"

echo "done!"