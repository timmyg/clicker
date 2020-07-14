1. create clicker location
2. create losant device
3. create pitunnel
4. create .env with LOCATION_ID, LOSANT_DEVICE_ID, PITUNNEL_TOKEN, and correct environment
5. burn base raspos-clicker image and drop .env file
   - `sudo balena local flash ~/Desktop/raspos-antenna-20200710-build1.img --drive /dev/disk2 --yes`
