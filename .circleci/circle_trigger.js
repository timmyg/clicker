const fetch = require("node-fetch");
const { exec } = require("child_process");

(async function main() {
  const circleUrl = `https://circleci.com/api/v1.1/project/github/${
    process.env.CIRCLE_PROJECT_USERNAME
  }/${process.env.CIRCLE_PROJECT_REPONAME}/tree/${
    process.env.CIRCLE_BRANCH
  }?filter=completed&limit=1`;
  console.log({ circleUrl });
  const response = await fetch(circleUrl, {
    // body: JSON.stringify(params),
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.CIRCLE_TOKEN).toString(
        "base64"
      )}`,
      "Content-Type": "application/json"
    },
    method: "GET"
  });
  const data = await response.json();
  console.log({ data });

  // exec('yarn check:changes', (error, stdout) => {
  //     modules.forEach(name => {
  //         if (!stdout.includes(name)) return;

  //         const params = {
  //             parameters: {
  //                 [name]: true,
  //                 trigger: false,
  //             },
  //             branch: process.env.CIRCLE_BRANCH,
  //         };

  //         fetch(
  //             `https://circleci.com/api/v2/project/github/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/pipeline`,
  //             {
  //                 body: JSON.stringify(params),
  //                 headers: {
  //                     Authorization: `Basic ${Buffer.from(
  //                         process.env.CIRCLE_TOKEN
  //                     ).toString('base64')}`,
  //                     'Content-Type': 'application/json',
  //                 },
  //                 method: 'POST',
  //             }
  //         ).then(console.log);
  //     });
  // });
})();
