### functions

##### migrating data via [dynamodump](https://github.com/bchew/dynamodump)

backup
```
python3 dynamodump.py --mode backup --region us-east-1 --accessKey [access-key-here] --secretKey [secret-key-here] --srcTable reservations-prod --dataOnly --skipThroughputUpdate
```

restore to same environment
```
python3 dynamodump.py --mode restore --region us-east-1 --accessKey [access-key-here] --secretKey [secret-key-here] --srcTable locations-prod --dataOnly --skipThroughputUpdate
```

restore to different environment
```
python3 dynamodump.py --mode restore --region us-east-1 --accessKey [access-key-here] --secretKey [secret-key-here] --srcTable locations-prod --destTable locations-develop --dataOnly --skipThroughputUpdate
```

* for on demand pricing tables, see fix here: https://github.com/bchew/dynamodump/pull/61/files