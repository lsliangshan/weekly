export default function getAllResponseHeaders () {
  return new Promise(resolve => {
    let xmlhttp
    // 获取response header信息
    if (window.XMLHttpRequest) {
      // code for Firefox, Mozilla, IE7, etc.
      xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp != null) {
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
          // 4 = "loaded"
          if (xmlhttp.status == 200) {
            // 200 = "OK
            resolve(xmlhttp.getAllResponseHeaders())
          } else {
            resolve('')
          }
        }
      };
      xmlhttp.open("GET", document.location.href, true);
      xmlhttp.send(null);
    } else {
      resolve('')
    }
  })
}