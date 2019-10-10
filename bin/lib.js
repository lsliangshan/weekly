const chalk = require('chalk')
const logSymbols = require('log-symbols')
const pkg = require('../package.json')
const Git = require('nodegit')
const kit = require('./kit')
const fs = require('fs')
const path = require('path')
const sep = path.sep

const showVersion = () => {
  console.log(chalk.magenta(`\n  ${pkg.name}@${pkg.version}\n`))
}

const whoami = () => {
  showVersion()
  console.log(logSymbols.success, chalk.green(pkg.author.name))
  console.log('')
}

const getCommits = (path, limitTs) => {
  return new Promise(resolve => {
    let commitsInfo = []
    Git.Repository.open(path).then(repo => {
      return repo.getMasterCommit()
    }).then(firstCommitOnMaster => {
      let history = firstCommitOnMaster.history();
      // Listen for commit events from the history.
      history.on("commit", function (commit) {
        let _date = commit.date().getTime()

        if (_date < limitTs[0] || _date > limitTs[1]) {
          return
        }
        commitsInfo.push({
          commit: commit.sha(),
          author: commit.author(),
          date: _date,
          message: commit.message()
        })
        console.log('commit: ', {
          commit: commit.sha(),
          author: commit.author(),
          date: _date,
          message: commit.message()
        })
      });

      history.on('error', (error) => {
        console.info('error:', error)
      })

      history.on('end', function (commits) {
        let res = commits.filter(item => (item.date().getTime() >= limitTs[0]) && (item.date().getTime() <= limitTs[1]))
        res.forEach(item => {
          let _author = item.author()
          commitsInfo.push({
            commit: item.sha(),
            author: {
              name: _author.name(),
              email: _author.email()
            },
            date: kit.formatDate(item.date().getTime()),
            message: item.message()
          })
        })
        // Use commits
        resolve(commitsInfo)
      });
      // Start emitting events.
      history.start();
    })
  })
}

const create = async (args) => {
  showVersion()
  let repositoryGit = 'https://github.com/nodegit/nodegit'
  // let repositoryGit = 'https://github.com/enkeljs/enkel-templates'
  let repositoryName = repositoryGit.split('/').pop()
  console.log('repositoryName: ', repositoryName)
  let rootPath = path.resolve(__dirname, `..${sep}repository${sep}${repositoryName}`)
  let allCommits = []
  let limitTs = kit.getThisWeekTs()
  limitTs[0] = limitTs[0] - 100000000000
  if (fs.existsSync(rootPath)) {
    allCommits = await getCommits(rootPath, limitTs)
    console.log('all commits: ', allCommits.length, allCommits)
  } else {
    Git.Clone(repositoryGit, rootPath).then(async (res) => {
      allCommits = await getCommits(rootPath, limitTs)
      console.log('all commits2: ', allCommits.length, allCommits)
    })
  }

  // Git.Clone('https://github.com/inig/dei2.admin.plugins', rootPath).then(res => {
  //   Git.Repository.open(rootPath).then(repo => {
  //     return repo.getMasterCommit()
  //   }).then(firstCommitOnMaster => {
  //     var history = firstCommitOnMaster.history();

  //     // Create a counter to only show up to 9 entries.
  //     var count = 0;

  //     // Listen for commit events from the history.
  //     history.on("commit", function (commit) {
  //       // Disregard commits past 9.
  //       if (++count >= 9) {
  //         return;
  //       }

  //       // Show the commit sha.
  //       console.log("commit " + commit.sha());

  //       // Store the author object.
  //       var author = commit.author();

  //       // Display author information.
  //       console.log("Author:\t" + author.name() + " <" + author.email() + ">");

  //       // Show the commit date.
  //       console.log("Date:\t" + commit.date().getTime());

  //       // Give some space and show the message.
  //       console.log("\n    " + commit.message());
  //     });

  //     // Start emitting events.
  //     history.start();
  //   })
  // })
}

module.exports = {
  whoami,
  create
}
