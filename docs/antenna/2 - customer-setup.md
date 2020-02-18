## Setting up customer device

##### before running device

1. register device to database
   - losant id (device id)
   - location name
   - active = false

##### plug in device at customer

2. customer labels tvs, if not labeled
3. (automatic) devices figures out DTV ip address, saves via api
4. (automatic) devices finds boxes, saves to api
5. manually hit api endpoint to change tvs to music channels
6. customer maps tv tags to channel numbers
7. manually hit api to sync tags with boxes
8. manually hit api to activate widget
