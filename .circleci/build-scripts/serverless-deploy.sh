npm run build --if-present
if [ "${CIRCLE_BRANCH}" == "master" ]; then
    npx serverless deploy --stage prod --verbose
fi
if [ "${CIRCLE_BRANCH}" == "release" ]; then
    npx serverless deploy --stage release --verbose
fi
if [ "${CIRCLE_BRANCH}" == "develop" ]; then
    npx serverless deploy --stage develop --verbose
fi