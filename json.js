var nodegit = require('nodegit');
var path = require('path');
var fs = require('fs');

const REPO_DIR = path.resolve(__dirname, '../acm-website-revamp/.git');

var json = {};
json.repo_name = 'acm-website-revamp';
json.commits = {};
json.numCommits = 0;

nodegit.Repository.open(REPO_DIR).then(repo => {
    return repo.getMasterCommit();
}).then(commit => {

    let sha = commit.sha();

    json.master_commit = sha;

    let history = commit.history(nodegit.Revwalk.SORT.Time);

    history.on('end', function(commits) {
        for (let commit of commits) {
            let sha = commit.sha();
            // console.log(commit.parents().length);

            json.commits[sha] = {
                parent: commit.parents().length != 0 ? commit.parents()[0].tostrS() : '',
                message: commit.message().trim('\n'),
                author: commit.author().name() + ' <' + commit.author().email() + '>'
            };
            json.numCommits++;
        }
        // console.log(json);
        fs.writeFile(`git-${json.repo_name}.json`, JSON.stringify(json, null, 4));

    });
    history.start();
});