#!/bin/bash
echo "running appflow.sh . . .";
if [ "$CI_APP_ID" = "aab910fb" ] # ionic appflow app id
then
    echo "Moving mobile app to root so that Appflow works";
    echo "remove everything except mobile/app directory";
    # find * -maxdepth 0 -name 'mobile' -prune -o -exec rm -rf '{}' ';'
    rm -rf README.md
    rm -rf docs
    rm -rf packages
    rm -rf setup-complete.txt
    rm -rf web
    rm -rf node_modules
    rm -rf package-lock.json
    rm -rf functions
    rm -rf netlify.toml
    echo "move to root";
    mv -v ./mobile/app/* ./
    echo "ls -lrt:";
    ls -lrt
else 
    echo "Not an Appflow build"; 
fi