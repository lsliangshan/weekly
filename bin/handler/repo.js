const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const pkg = require('../../package.json')
const shelljs = require('shelljs')
const kit = require('../kit')
const sep = path.sep

const rootPath = path.resolve(__dirname, `.${sep}`)
let adapter = new FileSync(rootPath + sep + 'templates.json')
let db = low(adapter)
const dbKey = 'repositories'
db.defaults({
  repositories: [
  ]
}).write()
// const defaultRepository = {
//   username: '',
//   password: '',
//   name: '',
//   url: '',
//   active: true // 当前选中的仓库
// }
function ls () {
  let repositories = db.get(dbKey).value()
  if (repositories.length === 0) {
    console.log('  暂未添加任何仓库')
    console.log(`  ${pkg.name} repository add <仓库名> <仓库地址> u=<仓库账号> p=<仓库密码>`)
  } else {
    let i = 0
    for (i; i < repositories.length; i++) {
      console.log((repositories[i].active ? ' * ' : '   ') + chalk.green(repositories[i].name) + '\t' + chalk.gray(repositories[i].url))
    }
  }
  console.log('\n')
}

const help = () => {
  console.log('  命令: \n')
  console.log(`    使用方式: ${pkg.name} repository ls\n`)
  console.log('    ls\t\t\t\t\t\t\t\t显示所有仓库')
  console.log('    current\t\t\t\t\t\t\t显示当前仓库')
  console.log('    use <仓库名>\t\t\t\t\t\t设置仓库')
  console.log('    add <仓库名> <仓库地址> u=<仓库账号> p=<仓库密码>\t\t新增仓库')
  console.log('    update <仓库名> <仓库地址> u=<仓库账号> p=<仓库密码>\t修改仓库配置, "u=": 清空仓库账号; "p=": 清空仓库密码')
  console.log('    del <仓库名>\t\t\t\t\t\t删除仓库')
  console.log('    help\t\t\t\t\t\t\t显示帮助信息')
  console.log('\n')
}

const current = () => {
  let curentRepo = db.get(dbKey).filter({ active: true }).value()
  console.log('\n   ' + chalk.green(curentRepo[0].name) + '\t' + chalk.gray(curentRepo[0].url) + '\n')
}

const use = (args) => {
  let _args = JSON.parse(JSON.stringify(args))
  let repoName = _args.shift()
  if (!repoName) {
    console.log('')
    console.log(logSymbols.error, '缺少参数【仓库名】\n')
  } else {
    let exists = db.get(dbKey).find({
      name: repoName
    }).value()
    if (!exists || !exists.name) {
      console.log('')
      console.log(logSymbols.error, `仓库【${chalk.yellow(repoName)}】不存在\n`)
    } else {
      // 取消当前选中的
      try {
        db.get(dbKey).find({
          active: true
        }).assign({
          active: false
        }).write()
        let res = db.get(dbKey).find({
          name: repoName
        }).assign({
          active: true
        }).write()
        console.log('')
        console.log(logSymbols.success, `仓库地址已经切换为【${chalk.yellow(res.url)}】\n`)
      } catch (err) {
        console.log('')
        console.log(logSymbols.error, `仓库切换失败\n`)
      }
    }
  }
}

const del = (args) => {
  let _args = JSON.parse(JSON.stringify(args))
  let repoName = _args.shift()
  if (!repoName) {
    console.log('')
    console.log(logSymbols.error, '缺少参数【仓库名】\n')
  } else {
    let exists = db.get(dbKey).find({
      name: repoName
    }).value()
    if (exists && exists.name) {
      if (exists.active) {
        console.log('')
        console.log(logSymbols.error, `仓库删除失败，仓库【${chalk.yellow(repoName)}】正在使用中\n`)
      } else {
        db.get(dbKey).remove({
          name: repoName
        }).write()
        console.log('')
        console.log(logSymbols.success, `仓库【${chalk.yellow(repoName)}】已经被删除\n`)
      }
    } else {
      console.log('')
      console.log(logSymbols.error, `仓库【${chalk.yellow(repoName)}】不存在\n`)
    }
  }
}

const add = (args) => {
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
  return new Promise((resolve, reject) => {
    if (!repoName) {
      console.log('')
      console.log(logSymbols.error, '缺少参数【仓库名称】\n')
      reject(new Error('缺少参数【仓库名称】'))
    } else if (!repoUrl) {
      console.log('')
      console.log(logSymbols.error, '缺少参数【仓库地址】\n')
      reject(new Error('缺少参数【仓库地址】'))
    } else {
      shelljs.exec(`curl ${repoUrl}`, (code, stdout, stderr) => {
        if (code !== 0) {
          console.log('')
          console.log(logSymbols.error, `仓库地址【${chalk.yellow(repoUrl)}】无法访问，请重新设置\n`)
          reject(new Error(`仓库地址【${repoUrl}】无法访问，请重新设置`))
        } else {
          let exists = db.get(dbKey).find({
            name: repoName
          }).value()
          if (!exists || !exists.name) {
            let repositories = db.get(dbKey).value()
            db.get(dbKey).push({
              name: repoName,
              url: repoUrl,
              username: username,
              password: password,
              active: repositories.length === 0 // 当前选中的仓库
            }).write()
            console.log('')
            console.log(logSymbols.success, `仓库【${chalk.green(repoName)}】添加成功\n`)
            resolve(`仓库【${repoName}】添加成功`)
          } else {
            console.log('')
            console.log(logSymbols.error, `仓库【${chalk.yellow(repoName)}】已经存在\n`)
            reject(new Error(`仓库【${repoName}】已经存在`))
          }
        }
      })
    }
  })
}

const update = (args) => {
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
  if (!repoName) {
    console.log('')
    console.log(logSymbols.error, '缺少参数【仓库名】\n')
  } else {
    let code = 0
    if (repoUrl) {
      code = shelljs.exec(`curl ${repoUrl}`).code
    }
    if (code !== 0) {
      console.log('')
      console.log(logSymbols.error, `仓库地址【${chalk.yellow(repoUrl)}】无法访问，请重新设置\n`)
    } else {
      let exists = db.get(dbKey).find({
        name: repoName
      }).value()
      if (!exists || !exists.name) {
        console.log('')
        console.log(logSymbols.error, `更新失败，仓库【${chalk.green(repoName)}】不存在\n`)
      } else {
        let updatedData = {}
        if (repoUrl) {
          updatedData.url = repoUrl
        }
        if (args.join(';').indexOf('u=') > -1) {
          updatedData.username = username
        }
        if (args.join(';').indexOf('p=') > -1) {
          updatedData.password = password
        }
        db.get(dbKey).find({
          name: repoName
        }).assign(updatedData).write()
        console.log('')
        console.log(logSymbols.success, `仓库【${chalk.yellow(repoName)}】更新成功\n`)
      }
    }
  }
}

const getCurrentRepo = () => {
  adapter = new FileSync(rootPath + sep + 'templates.json')
  db = low(adapter)
  let templateConfig = db.get(dbKey).find({
    active: true
  }).value()
  return (templateConfig || {})
}

const getRepoByName = (name) => {
  adapter = new FileSync(rootPath + sep + 'templates.json')
  db = low(adapter)
  let templateConfig = db.get(dbKey).find({
    name: name
  }).value()

  return (templateConfig || {})
}

const listRepositories = (data, socket) => {
  adapter = new FileSync(rootPath + sep + 'templates.json')
  db = low(adapter)
  let repositories = db.get(dbKey).value()
  socket.emit(kit.getActionName(data.action), {
    id: data.data.id,
    repositories: repositories.map(item => {
      return {
        name: item.name,
        url: item.url,
        active: item.active
      }
    })
  })
  return (repositories || [])
}

const addPepoFromWeb = async (data, socket) => {
  let formatData = []
  if (data.data.name) {
    formatData.push(data.data.name)
  }
  if (data.data.url) {
    formatData.push(data.data.url)
  }
  if (data.data.username) {
    formatData.push('u=' + data.data.username)
  }
  if (data.data.password) {
    formatData.push('p=' + data.data.password)
  }
  console.log('>>>>>>>>>', formatData)
  await add(formatData).then(res => {
    socket.emit(kit.getActionName(data.action), {
      id: data.data.id || '',
      status: 1, // 0: 失败，1: 成功
      name: data.data.name,
      url: data.data.url,
      message: res
    })
  }).catch(err => {
    socket.emit(kit.getActionName(data.action), {
      id: data.data.id || '',
      status: 0, // 0: 失败， 1: 成功
      name: data.data.name,
      url: data.data.url,
      message: err.message
    })
  })
}

module.exports = {
  ls,
  list: ls,
  help,
  '?': help,
  current,
  active: current,
  add,
  update,
  use,
  set: use,
  del,
  remove: del,
  delete: del,
  getCurrentRepo,
  getRepoByName,
  listRepositories,
  addPepoFromWeb
}