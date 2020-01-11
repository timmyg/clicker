echo -e "deploy clicker mobile"
if [ "${CIRCLE_BRANCH}" == "master" ]; then
    curl -X POST -d {} https://api.netlify.com/build_hooks/5c745a22aad21db652db51e1
fi
if [ "${CIRCLE_BRANCH}" == "release" ]; then
    curl -X POST -d {} https://api.netlify.com/build_hooks/5c745a2933754a346bf8ef90
fi
if [ "${CIRCLE_BRANCH}" == "develop" ]; then
    curl -X POST -d {} https://api.netlify.com/build_hooks/5c745a2f1056ec16dab4338b
fi