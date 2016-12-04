const express = require('express');
const co = require('co');
const cors = require('cors');

var GithubMetadata = require('./github-metadata');

var app = express();

app.set('json spaces', 2);

app.use(express.static('public'));

app.use(cors({credentials: true, origin: true}));

app.get('/', (req, res) => {
    res.sendFile('./index.html', { root: __dirname });
});

app.get('/api/ratelimit', (req, res) => {
    GithubMetadata.getRemainingRate(res);
});

app.get('/repo/:user/:repo_name', (req, res) => {
        GithubMetadata.getRepo(req, res);
});

app.listen(3000, () => {
    console.log('Running on port 3000...');
});
