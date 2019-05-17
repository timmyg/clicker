# copy the following files into boot directory
#   - setup.sh (this file)
#   - .env (customized for location)
#   - ssh
#   - wpa_supplicant.conf (if necessary)
#   - copy-env-vars.service
#   - antenna.service

# setup.sh  

echo "move copy-env-vars.service, antenna.service to /etc/systemd/system folder"
mv /boot/copy-env-vars.service /boot/antenna.service /etc/systemd/system
echo "done"

echo "install nodejs"
wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.lts.sh | bash
echo "done"

echo "install aws cli"
sudo apt-get update && sudo apt-get install awscli
echo "done"

echo "init antenna service" # (which calls copy-env-vars service)
sudo systemctl enable antenna
echo "TODO set password!"

echo "done!"