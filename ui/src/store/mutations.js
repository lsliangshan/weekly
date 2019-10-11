/***
 **                                                          _ooOoo_
 **                                                         o8888888o
 **                                                         88" . "88
 **                                                         (| -_- |)
 **                                                          O\ = /O
 **                                                      ____/`---'\____
 **                                                    .   ' \\| |// `.
 **                                                     / \\||| : |||// \
 **                                                   / _||||| -:- |||||- \
 **                                                     | | \\\ - /// | |
 **                                                   | \_| ''\---/'' | |
 **                                                    \ .-\__ `-` ___/-. /
 **                                                 ___`. .' /--.--\ `. . __
 **                                              ."" '< `.___\_<|>_/___.' >'"".
 **                                             | | : `- \`.;`\ _ /`;.`/ - ` : | |
 **                                               \ \ `-. \_ __\ /__ _/ .-` / /
 **                                       ======`-.____`-.___\_____/___.-`____.-'======
 **                                                          `=---='
 **
 **                                       .............................................
 **                                              佛祖保佑             永无BUG
 **                                      佛曰:
 **                                              写字楼里写字间，写字间里程序员；
 **                                              程序人员写程序，又拿程序换酒钱。
 **                                              酒醒只在网上坐，酒醉还来网下眠；
 **                                              酒醉酒醒日复日，网上网下年复年。
 **                                              但愿老死电脑间，不愿鞠躬老板前；
 **                                              奔驰宝马贵者趣，公交自行程序员。
 **                                              别人笑我忒疯癫，我笑自己命太贱；
 **                                              不见满街漂亮妹，哪个归得程序员？
 */
/**
 * Created by liangshan on 2017/7/13.
 */

import * as types from './mutation-types'

export const mutations = {
  [types.CACHE_CONNECT_STATUS] (state, data) {
    state.connectStatus = data.connectStatus
  },
  [types.CACHE_ENKEL_ENV] (state, data) {
    state.enkelEnv = data.enkelEnv
  },
  [types.CACHE_CURRENT_PATH] (state, data) {
    state.currentPath = data.currentPath
  },
  [types.SOCKET_CD] (state, data) {
    state.currentPath = data.path
    state.currentFileList = data.children
  },
  [types.SOCKET_LIST_TEMPLATES] (state, data) {
    state.templates = data.templates
  },
  [types.SOCKET_LIST_PACKAGE_MANAGER] (state, data) {
    state.pms = data.pms
  },
  [types.SOCKET_LIST_REPOSITORIES] (state, data) {
    state.repositories = data.repositories
  },
  [types.SOCKET_ECHO] (state, data) {
    state.logs.push(data)
    console.log('【普通消息】', data.message)
  },
  [types.SOCKET_STICKY_ECHO] (state, data) {
    state.stickyLogs.push(data)
    console.log('【固定消息】', data.message)
  },
  [types.SOCKET_TASK_FINISHED] (state, data) {
    if (!state.notices.some(item => item.id === data.id)) {
      state.notices.push(JSON.parse(JSON.stringify(data)))
    }
  },
  [types.CLEAR_LOGS] (state) {
    state.logs = []
  },
  [types.CLEAR_STICKY_LOGS] (state) {
    state.stickyLogs = []
  },
  [types.CONSUME_NOTICE] (state) {
    state.notices.shift()
  }
}
