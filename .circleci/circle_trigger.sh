CIRCLE_API="https://circleci.com/api"
REPOSITORY_TYPE="github"
# Identify modified directories
LAST_SUCCESSFUL_BUILD_URL="https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/tree/$CIRCLE_BRANCH?filter=completed&limit=1"
LAST_SUCCESSFUL_COMMIT=`curl -Ss -u "$CIRCLE_TOKEN:" $LAST_SUCCESSFUL_BUILD_URL | jq -r '.[0]["vcs_revision"]'`
#first commit in a branch
if [[ ${LAST_SUCCESSFUL_COMMIT} == "null" ]]; then
    COMMITS="origin/master"
else
    COMMITS="${CIRCLE_SHA1}..${LAST_SUCCESSFUL_COMMIT}"
fi
git diff --name-only $COMMITS | cut -d/ -f-2 | sort -u > projects
echo -e "Modified directories:\n`cat projects`\n"

projects_inc_dep=(`cat projects`)
echo -e "Building: ${projects_inc_dep[@]}\n"
for project in ${projects_inc_dep[@]}; do
    if grep -Fxq $project .projects; then
    # printf "\nTriggering build for project: "$project, ${CIRCLE_TOKEN}, ${project}, https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/tree/$CIRCLE_BRANCH
    echo -e "Project: ${project} $project \n"
    # curl -s -u ${CIRCLE_TOKEN}: \
    #   -d build_parameters[CIRCLE_JOB]=${project} \
    #   https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/tree/$CIRCLE_BRANCH


    DATA="{ \"branch\": \"$CIRCLE_BRANCH\", \"parameters\": { $PARAMETERS } }"
    URL="${CIRCLE_API}/v2/project/${REPOSITORY_TYPE}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/pipeline"
    echo -e "calling: $DATA $URL"
    HTTP_RESPONSE=$(curl -s -u ${CIRCLE_TOKEN}: -o response.txt -w "%{http_code}" -X POST --header "Content-Type: application/json" -d "$DATA" $URL)

    echo -e "response: $HTTP_RESPONSE"
    if [ "$HTTP_RESPONSE" -ge "200" ] && [ "$HTTP_RESPONSE" -lt "300" ]; then
        echo "API call succeeded."
        echo "Response:"
        cat response.txt
    else
        echo -e "\e[93mReceived status code: ${HTTP_RESPONSE}\e[0m"
        echo "Response:"
        cat response.txt
        exit 1
    fi

    fi
done