export function date (text) {
  if (!text) {
    return ''
  }
  let d = new Date()
  d.setTime(Number(text))
  let year = d.getFullYear()
  let month = d.getMonth() + 1
  month = (month < 10 ? '0' + month : month)
  let date = d.getDate()
  date = (date < 10 ? '0' + date : date)
  let hour = d.getHours()
  let minute = d.getMinutes()
  let second = d.getSeconds()
  let sep = '上午'
  let c = hour * 60 * 60 + minute * 60 + second
  if (c < 39600) {
    sep = '上午'
  } else if (c >= 39600 && c <= 46800) {
    sep = '中午'
  } else {
    sep = '下午'
  }
  hour = (hour < 10 ? '0' + hour : hour)
  minute = (minute < 10 ? '0' + minute : minute)
  second = (second < 10 ? '0' + second : second)
  return year + '-' + month + '-' + date + ' ' + sep + ' ' + hour + ':' + minute + ':' + second
}