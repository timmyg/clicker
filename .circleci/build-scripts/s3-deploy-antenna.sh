echo -e "upload antenna package to s3"
filename=
if [ "${CIRCLE_BRANCH}" == "master" ]; then
    filename="antenna.tar.gz"
fi
if [ "${CIRCLE_BRANCH}" == "release" ]; then
    filename="antenna-release.tar.gz"
fi
if [ "${CIRCLE_BRANCH}" == "develop" ]; then
    filename="antenna-develop.tar.gz"
fi
tar zcvf $filename *
aws s3 cp $filename s3://clicker-antenna/app/