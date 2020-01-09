const fetch = require("node-fetch");
const yaml = require("js-yaml");
const exec = require("await-exec");
const fs = require("fs");

(async function main() {
  const { active: activeProjects } = yaml.safeLoad(
    fs.readFileSync("./projects.yml", "utf8")
  );
  console.log({ activeProjects });
  const circleUrl = `https://circleci.com/api/v1.1/project/github/${
    process.env.CIRCLE_PROJECT_USERNAME
  }/${process.env.CIRCLE_PROJECT_REPONAME}/tree/${
    process.env.CIRCLE_BRANCH
  }?filter=completed&limit=1`;
  console.log({ circleUrl });
  const response = await fetch(circleUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.CIRCLE_TOKEN).toString(
        "base64"
      )}`,
      "Content-Type": "application/json"
    },
    method: "GET"
  });
  const data = await response.json();
  //   console.log({ data });
  const [{ vcs_revision: vcsRevision }] = data;

  const commitsRange = `${vcsRevision}...${process.env.CIRCLE_SHA1}`;
  console.log({ commitsRange });
  const { stdout: stdOutChangedProjects } = await exec(
    `git diff --name-only ${commitsRange} | cut -d/ -f-2 | sort -u`
  );

  const changedProjects = stdOutChangedProjects.split("\n");
  console.log({ changedProjects });
  const changedActiveProjects = changedProjects.filter(p =>
    activeProjects.includes(p)
  );
  console.log({ changedActiveProjects });

  for (const changedActiveProject of changedActiveProjects) {
    // replace slashes with dashes
    const project = changedActiveProject.replace(/\//g, "-");
    const params = {
      parameters: {
        [project]: true,
        trigger: false
      },
      branch: process.env.CIRCLE_BRANCH
    };

    console.log({ params });

    await fetch(
      `https://circleci.com/api/v2/project/github/${
        process.env.CIRCLE_PROJECT_USERNAME
      }/${process.env.CIRCLE_PROJECT_REPONAME}/pipeline`,
      {
        body: JSON.stringify(params),
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.CIRCLE_TOKEN
          ).toString("base64")}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );
  }
})();
