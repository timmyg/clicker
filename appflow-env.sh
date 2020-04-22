#!/bin/bash
echo "running appflow-env.sh . . .";
if [ "$CI_APP_ID" = "aab910fb" ] # ionic appflow app id
then
    echo "branch: $CI_GIT_REF"
    if [ "$CI_GIT_REF" = "master" ]
    then
        echo "1"
        export ENV=production
    elif [ "$CI_GIT_REF" = "release" ]
    then
        echo "2"
        export ENV=release
    elif [ "$CI_GIT_REF" = "develop" ]
    then
        echo "3"
        export ENV=develop
    fi
    echo "$ENV"
else 
    echo "Not an Appflow build"; 
fi