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
import Vue from 'vue'
import Vuex from 'vuex'
// import io from 'socket.io-client'
import * as actions from './actions'
import * as mutations from './mutations'
import * as getters from './getters'
import path from 'path'
// import { getHeader } from '../utils'
// import moduleEntrance from './modules/moduleEntrance'

Vue.use(Vuex);
// (async () => {
//   let port = await getHeader('Wsp')
//   console.log('.... connect port 66666: ', port)
//   let news = io.connect(`http://127.0.0.1:${port}/${port}`)
//   news.on('hi', (data) => {
//     console.log('from server 3: ', data)
//     alert('from server 3: ' + data)
//   })

//   news.on('disconnect', () => {

//   })
// })()
const store = new Vuex.Store({
  actions: actions.actions,
  mutations: mutations.mutations,
  getters: getters.getters,
  modules: {
    // moduleEntrance
  },
  state: {
    connectStatus: true,
    enkelEnv: {},
    currentPath: '',
    sep: path.sep,
    commands: {
      cd: 'cd'
    },
    currentFileList: [],
    templates: [], // 模板
    pms: [], // 包管理器
    repositories: [], // 所有模板仓库
    logs: [], // 来源于服务端的信息
    stickyLogs: [], // 来源于服务端的信息，sticky
    notices: [] // 通知
  }
})

export default store

global.store = store
