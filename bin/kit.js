const portfinder = require('portfinder')
const exec = require('child_process').exec
function _getFirstDayTs (date) {
  if (!date || typeof (date) === "string") {
    this.error("参数异常，请检查...");
  }
  var y = date.getFullYear(); // 年
  var m = date.getMonth() + 1; // 月
  var d = date.getDate(); // 日

  return (new Date(y + "-" + m + "-" + d + ' 00:00:00')).getTime()
}

function getThisWeekTs (date) {
  // https://www.cnblogs.com/wasabii/p/7756560.html
  let _date = date || (new Date())
  var weekday = _date.getDay() || 7; // 获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
  _date.setDate(_date.getDate() - weekday + 1); // 往前算（weekday-1）天，年份、月份会自动变化
  let ts = _getFirstDayTs(_date)
  return [ts, ts + 7 * 24 * 60 * 60 * 1000 - 1];
}

function formatDate (date) {
  let _date
  if (date) {
    _date = new Date(date)
  } else {
    _date = new Date()
  }
  let year = _date.getFullYear()
  let month = _date.getMonth() + 1
  month = (month < 10 ? '0' + month : month)
  let d = _date.getDate()
  d = (d < 10 ? '0' + d : d)
  let hour = _date.getHours()
  hour = (hour < 10 ? '0' + hour : hour)
  let minute = _date.getMinutes()
  minute = (minute < 10 ? '0' + minute : minute)
  let second = _date.getSeconds()
  second = (second < 10 ? '0' + second : second)
  return year + '-' + month + '-' + d + ' ' + hour + ':' + minute + ':' + second
}

function killPort (port) {
  return new Promise((resolve, reject) => {
    var order = `lsof -i:${port}`;
    exec(order, function (err, stdout, stderr) {
      if (err) { return }
      stdout.split('\n').filter(function (line) {
        var p = line.trim().split(/\s+/);
        var address = p[1];
        if (address != undefined && address != 'PID') {
          exec('kill ' + address, function (err, stdout, stderr) {
          })
        }
      })
      resolve(true)
    })
  })
}

function getPortsPromise (count, options = {}) {
  return new Promise((resolve) => {
    portfinder.getPorts(count, options, (err, ports) => {
      if (err) {
        resolve([])
      } else {
        resolve(ports || [])
      }
    })
  })
}

function getActionName (action) {
  return action.toUpperCase().replace(/-/g, '_')
}

module.exports = {
  getThisWeekTs,
  formatDate,
  getPortsPromise,
  killPort,
  getActionName
}