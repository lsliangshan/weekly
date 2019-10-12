const chalk = require('chalk')
const logSymbols = require('log-symbols')
const pkg = require('../package.json')
const Git = require('nodegit')
const kit = require('./kit')
const fs = require('fs')
const path = require('path')
const sep = path.sep
const ora = require('ora')
const shelljs = require('shelljs')
const Server = require('./server')
const repo = require('./handler/repo')

const env = require('../env.json')
shelljs.config.silent = true
const showVersion = () => {
  console.log(chalk.magenta(`\n  ${pkg.name}@${pkg.version}\n`))
}

const getCommits = (filePath, limitTs) => {
  return new Promise((resolve, reject) => {
    let commitsInfo = []
    Git.Repository.open(filePath).then(repo => {
      // return repo.getBranchCommit('master')
      // return repo.getBranchCommit('name')
      return repo.getMasterCommit()
    }).then(firstCommitOnMaster => {
      let history = firstCommitOnMaster.history();
      // Listen for commit events from the history.
      // history.on("commit", function (commit) {
      // let _date = commit.date().getTime()

      // if (_date < limitTs[0] || _date > limitTs[1]) {
      //   return
      // }
      // commitsInfo.push({
      //   commit: commit.sha(),
      //   author: commit.author(),
      //   date: _date,
      //   message: commit.message()
      // })
      // });

      history.on('error', (error) => {
        reject(new Error(error.message || ''))
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
        console.log('End: ', commitsInfo)
        // res[0].createRevWalk().commitWalk(10).then(function (stdVectorGitCommit) {
        //   console.log('stdVectorGitCommit: ', stdVectorGitCommit)
        // });
        // res[0].getTree().then(function (treeEntry) {
        //   // Use treeEntry
        //   // console.log('.....', treeEntry.entries())
        //   // revwalk.fileHistoryWalk(filePath, max_count).then(function (arrayHistoryEntry) {
        //   // })
        //   // tree.entries().forEach(item => {
        //   //   if (item.isDirectory()) {
        //   //     console.log('【文件夹】' + item.name())
        //   //   } else {
        //   //     console.log('    ' + chalk.yellow(item.name()))
        //   //   }
        //   // })
        // });
        resolve(commitsInfo)
      });
      // Start emitting events.
      history.start();
    }).catch(err => {
      reject(new Error(err.message ? err.message : '获取失败'))
    })
  })
}

const _formatArgs = (args) => {
  let _args = JSON.parse(JSON.stringify(args))
  let repoName = ''
  let repoUrl = ''
  let username = ''
  let password = ''
  _args.map(item => {
    if (item.match(/^u=(.*)$/)) {
      username = item.replace(/^(u=)(.*)$/, '$2')
    } else if (item.match(/^p=(.*)$/)) {
      password = item.replace(/^(p=)(.*)$/, '$2')
    } else if (!repoName) {
      repoName = item
    } else if (!repoUrl) {
      repoUrl = item
    } else { }
  })
  return {
    repoName,
    repoUrl,
    username,
    password
  }
}

const _beforeCreate = (args) => {
  let _args = _formatArgs(args)
  let repository = {}
  let repoUrl = _args.repoUrl || _args.repoName
  if (repoUrl) {
    repository = repo.getRepoByName(repoUrl)
    if (Object.keys(repository).length < 1) {
      // repoName 不是默认仓库名
      let code = shelljs.exec(`curl ${repoUrl}`).code
      if (String(code) === '0' && _args.username && _args.password) {
        // 是可访问的网址
        repository = {
          name: repoUrl.split('/').pop(),
          url: repoUrl,
          username: _args.username,
          password: _args.password,
          active: false
        }
      } else {
        console.log(logSymbols.error, `仓库【${_args.repoName}】不存在\n`)

        console.log(`  ${pkg.name} create <仓库名>\n`)

        console.log(chalk.yellow.italic('  或者\n'))

        console.log(`  ${pkg.name} create <仓库地址> u=<仓库账号> p=<仓库密码>\n`)

        console.log(chalk.yellow.italic('  或者\n'))

        console.log('  管理内置仓库，尝试以下命令\n')
        repo.help()
      }
    } else {
      // 是默认仓库名
    }
  } else {
    repository = repo.getCurrentRepo()
  }
  return repository
}

const create = async (args) => {
  showVersion()

  let repository = _beforeCreate(args)
  var cloneOptions = {};
  cloneOptions.fetchOpts = {
    callbacks: {
      credentials: () => Git.Cred.userpassPlaintextNew(repository.username, repository.password),
      transferProgress: (info) => {
        console.log(parseFloat(info.receivedObjects() / info.totalObjects() * 100).toFixed(2) + '%')
      }
    }
  }

  let repositoryGit = repository.url
  let repositoryName = repository.name
  let spinner = ora(`【${repositoryName}】周报生成中...`).start()
  let rootPath = path.resolve(__dirname, `..${sep}repository${sep}${repositoryName}`)
  let allCommits = []
  let limitTs = args.date ? args.date : kit.getThisWeekTs()
  // limitTs[0] = limitTs[0] - 21 * 24 * 60 * 60 * 1000
  if (fs.existsSync(rootPath)) {
    shelljs.rm('-rf', rootPath)
  }
  Git.Clone(repositoryGit, rootPath, cloneOptions).then(async (res) => {
    allCommits = await getCommits(rootPath, limitTs).then(() => {
      spinner.succeed(`【${repositoryName}】周报生成成功`)
    }).catch(err => {
      spinner.fail(err.message ? `【${repositoryName}】周报生成失败: ${err.message}` : `【${repositoryName}】周报生成失败`)
    })
    console.log('all commits: ', allCommits.length, allCommits)
  })
}

const ui = async () => {
  showVersion()

  let [port, port2] = await kit.getPortsPromise(2, {
    port: 8199,
    stopPort: 8999,
    host: '127.0.0.1'
  })
  console.log('ENV: ', env)
  if (env.production) {
    shelljs.cd(path.resolve(__dirname, `..${sep}`))
  } else {
    shelljs.cd(path.resolve(__dirname, `..${sep}ui`))
  }
  console.log('>>2>>', process.cwd())
  const enkelConfig = {
    port: port,
    socket: {
      port: port2,
      host: '127.0.0.1',
      path: '/enkel'
    }
  }

  let webpackConfigFile = path.resolve(__dirname, `..${sep}webpack.config.js`)

  if (env.production) {
    let originConfig = fs.readFileSync(webpackConfigFile, { encoding: 'utf-8' })
    originConfig = originConfig.replace(/("port":\s*[a-zA-Z0-9]*,)/, `"port": ${port},`).replace(/("Wsp":\s*[a-zA-Z0-9]*,)/, `"Wsp": ${port2},`)
    fs.writeFileSync(webpackConfigFile, originConfig, {
      flag: 'w+'
    })
  }
  await Server.createSocketServer(enkelConfig)
  if (env.production) {
    shelljs.exec(`yarn dev`, { async: true })
  } else {
    shelljs.exec(`yarn serve --hot`, { async: true, silent: true })
  }
  console.log(logSymbols.success, `服务已启动：http://127.0.0.1:${port}`)
}

module.exports = {
  create,
  ui
}
