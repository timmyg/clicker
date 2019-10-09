#!/bin/bash
 
# manually run this to update a dependency in all functions

# Declare an array of string with type
declare -a StringArray=("admin" "analytics" "app" "game" "job" "lead" "location" "program" "remote" "reservation" "user")
 
# Iterate the string array using for loop
for val in ${StringArray[@]}; do
   echo $val
   cd ~/Code/other/clicker/functions/$val
   npm i git+https://github.com/timmyg/serverless-helpers.git#v0.3.11
   npm i serverless-sentry
   echo "updated $val function"
done