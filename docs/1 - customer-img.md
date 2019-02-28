## Customizing image for customer

##### on raspberry pi (w/ sd card)

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

2. add env vars
   - add environment variables to /home/pi/.env [file](resources/.env-example)
   - `scp .env pi@raspberrypi.local:`
3. add pi tunnel for remote ssh access
   - (get from website)
   - `curl https://pitunnel.com/inst/EPumXXXX | sudo python`
