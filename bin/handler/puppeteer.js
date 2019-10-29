// npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
const puppeteer = require('puppeteer')
const os = require('os')
const path = require('path')
const kit = require('../kit')

const pdf = (data, socket) => {
  (async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(data.data.html, {
      waitUntil: ["load", "domcontentloaded", "networkidle0"],
      timeout: 10 * 1000 // Maximum time in milliseconds for resources to load
    })
    await page.addStyleTag({
      path: require('path').resolve(__dirname, './repo.css')
      // content: '@page {size: a4}; .generate-result-content-body{width:100%;height:calc(100% - 48px);padding:20px 10px 10px 10px;box-sizing:border-box;overflow-y:auto}.content-item{width:100%;margin-bottom:10px}.content-item-header{width:100%;height:30px;border-left:6px solid #2b5b5b;padding-left:16px;margin:20px 0;box-sizing:border-box;color:#282828;display:flex;flex-direction:row;align-items:center;justify-content:flex-start}.content-item-header-name{font-size:18px;font-weight:bold;}.content-item-header-email{font-size:13px;margin-left:20px;color:#9e9e9e}.content-item-body-item{padding:0 10px 0 0;color:#333333;font-size:14px;word-break:break-all;margin:10px 0;display:flex;flex-direction:row;align-items:flex-start;justify-content:flex-start}.body-item-index{width:30px;white-space:nowrap;text-align:right;margin-right:8px}.body-item-content{flex:1}.body-item-content-date {color: #888888;}'
    })
    await page.emulateMedia('screen')
    let pdfData = await page.pdf({
      path: path.resolve(os.homedir(), '.' + path.sep + 'Downloads' + path.sep + (data.data.filename || 'weekly.pdf')),
      format: 'A4',
      margin: {
        left: '20px',
        top: '20px',
        right: '20px',
        bottom: '20px'
      },
      printBackground: true,
      displayHeaderFooter: true,
      // updateCountersAfterPageRanges: true,
      footerTemplate: ({ pageNumber, totalPages }) => {
        return `<span style="font-size: 18px; color: #000; background-color: #fff;">Weekly Repo<span>`
      },
    })
    socket.emit(kit.getActionName(data.action), {
      id: data.data.id || '',
      data: Buffer.from(pdfData),
      type: 'pdf'
    })
    await browser.close()
  })()
}

module.exports = {
  pdf
}