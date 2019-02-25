git diff --no-commit-id --name-only -r `git log -n 2 --oneline --pretty=format:"%h" | tail -n1` | cut -d/ -f1 | sort -u > projects
echo -e "Modified directories:`cat projects`\n"
projects_inc_dep=(`cat projects`)
echo -e "Calculating dependencies\n"
for dir in `ls -d */`; do
    for dep in `go list -f '{{ .Deps }}' ./${dir} 2>/dev/null`; do
    for project_dep in `echo $dep | grep github.com/teamclicker/clicker | egrep -v "vendor|${dir%\/}"`; do
        if [[ " ${projects_inc_dep[@]} " =~ " ${project_dep##*\/} " ]] && ! [[ " ${projects_inc_dep[@]} " =~ " ${dir%\/} " ]]; then
        projects_inc_dep+=(${dir%\/})
        fi
    done
    done
done
echo -e "Building: ${projects_inc_dep[@]}\n"
for project in ${projects_inc_dep[@]}; do
    if grep -Fxq $project project-dirs; then
    printf "\nTriggering build for project: "$project
    curl -s -u ${CIRCLE_TOKEN}: \
        -d build_parameters[CIRCLE_JOB]=${project} \
        https://circleci.com/api/v1.1/project/github/teamclicker/clicker/tree/$CIRCLE_BRANCH
    fi
done