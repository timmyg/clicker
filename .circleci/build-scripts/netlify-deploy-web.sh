echo -e "deploy clicker web"
if [ "${CIRCLE_BRANCH}" == "master" ]; then
curl -X POST -d {} https://api.netlify.com/build_hooks/5c7458709c6a819dd611ee82
fi
if [ "${CIRCLE_BRANCH}" == "release" ]; then
curl -X POST -d {} https://api.netlify.com/build_hooks/5c74588dce2aff6b7eb9d135
fi
if [ "${CIRCLE_BRANCH}" == "develop" ]; then
curl -X POST -d {} https://api.netlify.com/build_hooks/5c745884ad8fd5e199de18cf
fi
if [ "${CIRCLE_BRANCH}" == "variant" ]; then
curl -X POST -d {} https://api.netlify.com/build_hooks/5eb953848f7aa35c9edb9b82
fi