const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: "fa2d96785bcfe7ccf85cdd5cedae4f6354ba4b51"
});

octokit.paginate(
  "GET /repos/:owner/:repo/pulls?state=:state",
  {
    owner: "SonarSource",
    repo: "sonarcloud-core",
    state: "open"
  })
  .then((data) => {
    data.forEach(pr => {
      var output = "PR "
      if (pr.draft) {
        output += "(draft) "
      }
      output += pr.number + " by " + pr.user.login + ": ";
      output += pr.head.ref + " ==> " + pr.base.ref
      console.log(output)
      // console.log(pr.head.sha, pr.base.sha)
    });
  });

