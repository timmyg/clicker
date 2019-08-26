#!/bin/bash
echo "running appflow.sh . . .";
if [ "$CI_APP_ID" = "aab910fb" ] # ionic appflow app id
then
    echo "Moving mobile app to root so that Appflow works";
    echo "Appflow build";
    mv -v ./mobile/app/* ./
else 
    echo "Not an Appflow build"; 
fi