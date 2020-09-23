const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});
const colors = require("colors")

octokit.repos.getBranch({
  owner: "SonarSource",
  repo: "sonarcloud-core",
  branch: "master"
}).then(branch => {
  var masterNode = {
    headSha: branch.data.commit.sha,
    ref: "master",
    output: ("Master at #" + branch.data.commit.sha.substr(0,7)).green,
    children: []
  }

  octokit.paginate(
    "GET /repos/:owner/:repo/pulls?state=:state",
    {
      owner: "SonarSource",
      repo: "sonarcloud-core",
      state: "open"
    })
    .then((data) => {
      data.sort((a, b) => a.id - b.id).forEach(pr => {
        var newNode = {
          headSha: pr.head.sha,
          baseSha: pr.base.sha,
          baseRef: pr.base.ref,
          ref: pr.head.ref,
          output: renderOutput(pr),
          children: []
        }

        addNode(masterNode, newNode)
      });

      outputAsTree(masterNode)
    })
})

function addNode(node, newNode) {
  if (node.ref == newNode.baseRef) {
    if (newNode.baseSha != node.headSha) {
      newNode.output += " " + "(branch have new commits)".bgRed.white
    }
    node.children.push(newNode)
  } else {
    node.children.forEach((childNode, index) => {
      addNode(childNode, newNode)
    })
  }
}

function renderOutput(pr) {
  var output = "PR ".green
  if (pr.draft) {
    output += "(DRAFT) ".yellow
  }
  output += (pr.number + " by " + pr.user.login + ": \n").green;
  output += pr.head.ref + " at #" + pr.head.sha.substr(0,7) + " ---> " + pr.base.ref + " at #" + pr.base.sha.substr(0,7)

  return output
}

function outputAsTree(node, level = 0) {
  node.output.split("\n").forEach(line => {
    console.log("  ".repeat(level) + line)
  })
  if (node.children.length > 0) {
    console.log("  ".repeat(level) + "\\")
  }
  node.children.forEach(childNode => {
    outputAsTree(childNode, level + 1)
  })
}
