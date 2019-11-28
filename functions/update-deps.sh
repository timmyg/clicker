#!/bin/bash
 
# manually run this to update a dependency in all functions

# Declare an array of string with type
declare -a StringArray=("admin" "analytics" "app" "game" "job" "lead" "location" "notification" "program" "remote" "reservation" "user")
 
# Iterate the string array using for loop
for val in ${StringArray[@]}; do
   echo $val
   cd ~/Code/clicker/functions/$val && npm install --save-dev serverless-plugin-tracing@latest && npm install aws-xray-sdk aws-sdk
   # cd ~/Code/other/other/clicker/functions/$val && npm i
   echo "updated $val function"
done