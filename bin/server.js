const shelljs = require('shelljs')
const logSymbols = require('log-symbols')
const ora = require('ora')
const spinner = ora('创建socket服务')
const kit = require('./kit')
const repo = require('./handler/repo')

async function commandHandler (data, socket) {
  let action = data.action.toLowerCase()
  switch (action) {
    case 'list-repositories':
      repo.listRepositories(data, socket)
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
  createSocketServer
}