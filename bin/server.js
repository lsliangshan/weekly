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
// const Server = require('./server')
const repo = require('./handler/repo')
const puppeteer = require('./handler/puppeteer')

const spinner = ora('创建socket服务')
const env = require('../env.json')
shelljs.config.silent = true
const showVersion = () => {
  console.log(chalk.magenta(`\n  ${pkg.name}@${pkg.version}\n`))
}

const postProgress = (progress, socket) => {
  socket.emit(kit.getActionName('generate-progress'), {
    progress: progress
  })
}

const postCommitInfo = (info, socket) => {
  socket.emit(kit.getActionName('commit-info'), {
    info: info
  })
}

const getCommits = (filePath, limitTs, socket) => {
  return new Promise((resolve, reject) => {
    let commitsInfo = []
    Git.Repository.open(filePath).then(repository => {
      // return repo.getBranchCommit('master')
      // return repo.getBranchCommit('name')
      return repository.getMasterCommit()
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
      const excludeCommit = [
        'merge',
        'test'
      ]
      const excludeCommitRegExp = new RegExp('^' + excludeCommit.join('|'), 'im')
      history.on('end', function (commits) {
        let res = commits.filter(item => ((item.date().getTime() >= limitTs[0]) && (item.date().getTime() <= limitTs[1]) && !item.message().match(excludeCommitRegExp)))
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
        postProgress(100, socket)
        postCommitInfo(commitsInfo, socket)
        // Use commits
        // console.log('End: ', commitsInfo, '$')
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
  let name = ''
  let url = ''
  let username = ''
  let password = ''
  if (Object.prototype.toString.call(_args) === '[object Array]') {
    _args.map(item => {
      if (item.match(/^u=(.*)$/)) {
        username = item.replace(/^(u=)(.*)$/, '$2')
      } else if (item.match(/^p=(.*)$/)) {
        password = item.replace(/^(p=)(.*)$/, '$2')
      } else if (!name) {
        name = item
      } else if (!url) {
        url = item
      } else { }
    })
  } else {
    name = _args.name || ''
    url = _args.url || ''
    username = _args.username || ''
    password = _args.password || ''
  }
  return {
    name,
    url,
    username,
    password
  }
}

const _beforeCreate = (args) => {
  let _args = _formatArgs(args)
  let repository = {}
  let url = _args.url || _args.name
  if (url) {
    repository = repo.getRepoByName(_args.url ? _args.name : url)
    if (Object.keys(repository).length < 1) {
      // name 不是默认仓库名
      let code = shelljs.exec(`curl ${url}`).code
      if (String(code) === '0' && _args.username && _args.password) {
        // 是可访问的网址
        repository = {
          name: url.split('/').pop(),
          url: url,
          username: _args.username,
          password: _args.password,
          active: false
        }
      } else {
        console.log(logSymbols.error, `仓库【${_args.name}】不存在\n`)

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

const create = async (args, socket) => {
  showVersion()

  let repository = _beforeCreate(args)
  var cloneOptions = {};
  cloneOptions.fetchOpts = {
    callbacks: {
      credentials: () => Git.Cred.userpassPlaintextNew(repository.username, repository.password),
      transferProgress: (info) => {
        postProgress(parseFloat(info.receivedObjects() / info.totalObjects() * 100).toFixed(2), socket)
        // console.log(parseFloat(info.receivedObjects() / info.totalObjects() * 100).toFixed(2) + '%')
      }
    }
  }

  let repositoryGit = repository.url
  let repositoryName = repository.name
  if (repositoryName) {
    let spinner = ora(`【${repositoryName}】周报生成中...`).start()
    let rootPath = path.resolve(__dirname, `..${sep}repository${sep}${repositoryName}`)
    let allCommits = []
    let limitTs = args.date ? args.date : kit.getThisWeekTs()
    // limitTs[0] = limitTs[0] - 21 * 24 * 60 * 60 * 1000
    if (fs.existsSync(rootPath)) {
      shelljs.rm('-rf', rootPath)
    }
    Git.Clone(repositoryGit, rootPath, cloneOptions).then(async (res) => {
      allCommits = await getCommits(rootPath, limitTs, socket).then(() => {
        spinner.succeed(`【${repositoryName}】周报生成成功`)
      }).catch(err => {
        spinner.fail(err.message ? `【${repositoryName}】周报生成失败: ${err.message}` : `【${repositoryName}】周报生成失败`)
      })
      console.log('all commits: ', allCommits.length, allCommits)
    })
  }
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
  await createSocketServer(enkelConfig)
  if (env.production) {
    shelljs.exec(`yarn dev`, { async: true })
  } else {
    shelljs.exec(`yarn serve --hot`, { async: true, silent: true })
  }
  console.log(logSymbols.success, `服务已启动：http://127.0.0.1:${port}`)
}

async function commandHandler (data, socket) {
  let action = data.action.toLowerCase()
  switch (action) {
    case 'list-repositories':
      repo.listRepositories(data, socket)
      break
    case 'generate':
      create(data.data, socket)
      break
    case 'save-repo':
      repo.addPepoFromWeb(data, socket)
      break
    case 'create-pdf':
      puppeteer.pdf(data, socket)
      break
    default:
      break
  }
}

async function createSocketServer (args) {
  return new Promise(async (resolve) => {
    let users = []
    spinner.start()
    let socketPort = args.socket.port || 8200
    let io = require('socket.io')(socketPort)
    io.of('/' + socketPort).on('connection', (socket) => {
      console.log('connection', socketPort)

      if (users.indexOf(socket.id) < 0) {
        users.push(socket.id)
      }
      socket.emit('hi', Array.from(process.env))

      socket.on('exec', (data) => {
        console.log(`【${data.action}】: ${JSON.stringify(data.data, null, 2)}`)
        commandHandler(data, socket)
      })

      socket.on('disconnect', () => {
        let _userIndex = users.indexOf(socket.id)
        if (_userIndex > -1) {
          users.splice(_userIndex, 1)
        }
        setTimeout(async () => {
          if (users.length < 1) {
            await kit.killPort(args.port)
            await kit.killPort(socketPort)
            shelljs.exit(1)
          }
        }, 1000)
      })
    })

    spinner.succeed('服务启动成功')
    console.log(logSymbols.success, `ws服务已启动：http://127.0.0.1:${socketPort}/${socketPort}`)
    resolve(true)
  })
}

module.exports = {
  createSocketServer,
  create,
  ui
}