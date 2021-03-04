create device for customer use

1. burn raspos-antenna image
   - `sh flash-raspos-antenna.sh`
2. create .env file
   - TODO: script for:
     - creating location via clicker api
     - create device in losant
     - populating .env template with variables (hogan)
3. copy .env
   `sudo sh copy-env.sh`
4. copy `wpa_supplicant.conf` if using wi-fi connection
