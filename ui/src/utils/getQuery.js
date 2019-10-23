export default function getQuery (name) {
  let search = location.search.substring(1)
  if (!search) {
    return {}
  }
  let query = {}
  search.split('&').forEach(item => {
    if (!query.hasOwnProperty(item.split('=')[0])) {
      query[item.split('=')[0]] = item.split('=')[1]
    }
  })
  return name ? (query[name] || '') : query
}