var Github = require('github-api');

const Env = require('./data.json');

const gh = new Github({
    username: "lannonbr", // use your username
    password: Env.passwd // Put in your password into a json file named data.json
});

function getRemainingRate(res) {
    gh.getRateLimit().getRateLimit().then(result => {
        let data = result.data;
        return res.json(data);
    })
}

function getAllShas(repo) {
    return repo.listCommits({
        since: "2016-01-01T00:00:00Z",
        until: "2017-01-01T00:00:00Z",
        per_page: 1000
    })
        .then(commits => commits.data)
        .then(data => data.map(item => item.sha));
}

function getMetadata(shas, repo) {
    return Promise.all(shas.map(sha => repo.getSingleCommit(sha)))
        .then(fullCommits => {
            return fullCommits.map(commit => {
                let data = commit.data;
                return {
                    sha: data.sha,
                    message: data.commit.message,
                    stats: data.stats,
                    author: {
                        name: data.commit.author.name,
                        email: data.commit.author.email
                    },
                    parents: data.parents
                };
            });
        })
}

function getRepo(req, res) {
    var repo = gh.getRepo(req.params.user, req.params.repo_name);

    return getAllShas(repo).then(shas => {
        return getMetadata(shas, repo);
    }).then(commitMetadataJSON => {
        return repo.listBranches().then(branchContent => {
            res.json({
                repo_name: `${req.params.user}/${req.params.repo_name}`,
                numCommits: commitMetadataJSON.length,
                commits: commitMetadataJSON,
                branches: branchContent.data
            });
        });
    }).catch(err => console.log(err));
}

module.exports = {
    getRemainingRate,
    getRepo
};