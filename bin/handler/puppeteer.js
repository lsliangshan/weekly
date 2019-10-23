// npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
const puppeteer = require('puppeteer')
const kit = require('../kit')

const pdf = (data, socket) => {
  (async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(data.data.html)
    let pdfData = await page.pdf({
      path: data.data.filename || 'weekly.pdf',
      format: 'A4',
      margin: {
        top: '20px',
        right: '40px',
        bottom: '20px',
        left: '40px'
      }
    })
    socket.emit(kit.getActionName(data.action), {
      id: data.data.id || '',
      data: pdfData,
      type: 'pdf'
    })
    await browser.close()
  })()
}

module.exports = {
  pdf
}