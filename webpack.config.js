module.exports = {
  "devServer": {
    "open": true,
    "port": 8199,
    "host": "127.0.0.1",
    "contentBase": "ui/dist",
    "hot": true,
    "headers": {
      "Wsp": 8201,
      "X-Powered-By": "Enkel"
    }
  }
}