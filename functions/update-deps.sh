#!/bin/bash
 
# manually run this to update a dependency in all functions

# Declare an array of string with type
declare -a StringArray=("admin" "analytics" "app" "game" "job" "lead" "location" "notification" "program" "remote" "reservation" "user")
 
# Iterate the string array using for loop
for val in ${StringArray[@]}; do
   echo $val
   npx prettier --write $val/*.js
   # cd ~/Code/clicker/functions/$val && npx flow-typed create-stub airtable serverless-helpers aws-xray-sdk axios camelcase-keys dynamoose moment-timezone object-mapper lodash moment hubspot trello geolib uuid/v1 uuid/v5 losant-rest stripe jsonwebtoken twilio @slack/webhook
   # cd ~/Code/other/other/clicker/functions/$val && npm i
   echo "updated $val function"
done