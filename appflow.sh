#!/bin/bash
echo "running appflow.sh . . .";
if [ "$CI_APP_ID" = "aab910fb" ] # ionic appflow app id
then
    echo "Moving mobile app to root so that Appflow works";
    echo "remove everything except mobile/app directory";
    find * -maxdepth 0 -name 'mobile' -prune -o -exec rm -rf '{}' ';'
    echo "move to root";
    mv -v ./mobile/app/* ./
    echo "ls:";
    ls
else 
    echo "Not an Appflow build"; 
fi