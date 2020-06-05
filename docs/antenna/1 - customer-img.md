## Customizing image for customer

##### on raspberry pi (w/ sd card)

0. use etcher to write image
1. configure wifi

   - `wpa_passphrase` to generate encrypted psk password (need ssid and password)
   - `sudo nano /etc/wpa_supplicant/wpa_supplicant.conf`
   - like so:
     ```
     network={
         ssid="MyNetwork33"
         psk=131e1e221f6e06e3911a2d11ff2fac9182665c004de85300f9cac208a6a80531
     }
     ```

1. follow instructions at top of [setup.sh](image/setup.sh)
1. add env vars
   - add environment variables to /home/pi/.env [file](image/.env-example)
   - `scp .env pi@raspberrypi.local:`
1. add pi tunnel for remote ssh access
   - (get from website)
   - `curl https://pitunnel.com/inst/EPumXXXX | sudo python`
