<template>
  <div class="generate-container">
    <div class="generate-header">Weekly</div>
    <div class="generate-content">
      <div class="generate-inner">
        <div class="generate-form">
          <Form :label-width="90"
                label-colon
                :model="generateFormData">
            <FormItem label="仓库">
              <Select v-model="activeRepo"
                      label-in-value
                      @on-change="changeRepository">
                <Option value="default">自定义</Option>
                <Option v-for="(repo, index) in repositories"
                        :key="index"
                        :value="repo.url"
                        :label="repo.name">
                  <Tooltip :content="repo.url"
                           placement="bottom"
                           style="width: 100%;"
                           transfer>
                    <div class="option-item">
                      <span class="option-item-name">{{repo.name}}</span>
                      <span class="option-item-url">{{repo.url}}</span>
                    </div>
                  </Tooltip>
                </Option>
              </Select>
            </FormItem>
            <FormItem label="仓库地址"
                      required>
              <Input placeholder="请输入仓库地址"
                     :disabled="activeRepo !== 'default'"
                     v-model="generateFormData.url"
                     clearable
                     @on-change="changeRepoUrl" />
            </FormItem>
            <FormItem label="仓库名称">
              <Input placeholder="请输入仓库名称"
                     v-model="generateFormData.name"
                     clearable
                     :disabled="activeRepo !== 'default'"
                     @on-change="setInputManually(true)" />
            </FormItem>
            <transition name="fade">
              <FormItem label="仓库账号"
                        v-if="activeRepo === 'default'"
                        key="repo-username">
                <Input placeholder="请输入仓库账号"
                       clearable
                       v-model="generateFormData.username" />
              </FormItem>
            </transition>
            <transition name="fade">
              <FormItem label="仓库密码"
                        v-if="activeRepo === 'default'"
                        key="repo-password">
                <Input placeholder="请输入仓库密码"
                       clearable
                       v-model="generateFormData.password" />
              </FormItem>
            </transition>
            <FormItem label="时间">
              <DatePicker type="datetimerange"
                          :options="reportDateOptions"
                          placement="bottom-end"
                          placeholder="请选择起止时间"
                          style="width: 100%;"
                          v-model="generateDate"></DatePicker>
            </FormItem>
            <FormItem>
              <Button type="primary"
                      :loading="isGenerating"
                      @click="generate">
                <span v-if="!isGenerating">生成周报</span>
                <span v-else>正在生成...</span>
              </Button>
            </FormItem>
          </Form>
        </div>
        <div class="generate-result">
          <div class="generate-result-inner">
            <transition name="fade">
              <div class="generate-result-loading"
                   v-if="isGenerating">
                <iCircle :percent="generateProgress"
                         stroke-color="green">
                  <Icon v-if="generateProgress == 100"
                        type="ios-checkmark"
                        size="60"
                        style="color:#5cb85c"></Icon>
                  <span v-else
                        style="font-size:24px">{{ generateProgress }}%</span>
                </iCircle>
              </div>
            </transition>
            <transition name="fade">
              <div class="generate-result-empty"
                   v-if="!isGenerating && !currentRepo.name">请先生成周报</div>
            </transition>
            <transition name="fade">
              <div class="generate-result-content"
                   v-if="!isGenerating && currentRepo.name">
                <Tooltip :content="currentRepo.url"
                         placement="bottom-end"
                         style="width: 100%;">
                  <div class="generate-result-content-header">
                    <div class="generate-result-content-header-name">{{currentRepo.name}}</div>
                    <div class="generate-result-content-header-url">{{currentRepo.url}}</div>
                  </div>
                </Tooltip>
                <div class="generate-result-content-body">
                  <div class="content-item"
                       v-for="(commits, name) in commitInfo"
                       :key="commits[0].commit">
                    <div class="content-item-header">
                      <div class="content-item-header-name">
                        {{name}}
                      </div>
                      <div class="content-item-header-email">
                        &lt; {{commits[0].author.email}} &gt;
                      </div>
                    </div>
                    <div class="content-item-body">
                      <div class="content-item-body-item"
                           v-for="(commit, index) in commits"
                           :key="commit.commit">
                        <div class="body-item-index">
                          {{index + 1}}.
                        </div>
                        <div class="body-item-content">
                          {{commit.message.replace(/[\r\n]/g, '')}}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Tooltip, Icon, Poptip, Switch, Input, Modal, Button, Form, FormItem, Select, Option, Spin, DatePicker, Circle } from 'view-design'
  export default {
    name: 'Create',
    components: {
      Tooltip, Icon, Poptip,
      iSwitch: Switch,
      iCircle: Circle,
      Input, Modal, Button, Form, FormItem, Select, Option, Spin, DatePicker
    },
    sockets: {
      'LIST_REPOSITORIES' (data) {
        this.repositories = data.repositories
      },
      'GENERATE_PROGRESS' (data) {
        this.generateProgress = Number(data.progress)
      },
      'COMMIT_INFO' (data) {
        this.commitInfo = this.formatCommitInfo(data.info)
        setTimeout(() => {
          this.isGenerating = false
          this.generateProgress = 0
        }, 1500)
      }
    },
    data () {
      return {
        repositories: [],
        isGenerating: false, // 正在生成周报
        generateDate: [],
        inputManually: false, // 是否手动输入的仓库名称
        activeRepo: 'default', // 自定义仓库
        generateProgress: 0, // 周报生成进度
        commitInfo: [], // 周报内容
        currentRepo: {}, // 当前仓库信息
        generateFormData: {
          name: '',
          url: '',
          username: '',
          password: '',
          date: []
        },
        reportDateOptions: {
          shortcuts: [
            {
              text: '上周',
              value () {
                let now = new Date()
                let start = new Date()
                let end = new Date()
                var weekday = now.getDay() || 7 // 获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
                start.setDate(now.getDate() - weekday - 7 + 1) // 往前算（weekday-1）天，年份、月份会自动变化
                start.setHours(0)
                start.setMinutes(0)
                start.setSeconds(0)
                end.setTime(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000)
                return [start, end];
              }
            },
            {
              text: '本周',
              value () {
                let now = new Date()
                let start = new Date()
                let end = new Date()
                var weekday = now.getDay() || 7 // 获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
                start.setDate(now.getDate() - weekday + 1) // 往前算（weekday-1）天，年份、月份会自动变化
                start.setHours(0)
                start.setMinutes(0)
                start.setSeconds(0)
                end.setTime(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000)
                return [start, end];
              }
            },
            {
              text: '本月',
              value () {
                let now = new Date()
                let year = now.getFullYear()
                let month = now.getMonth() + 1
                let start = new Date(year + '-' + month + '-1 0:0:0')
                let nextMonth
                let nextYear = year
                if (month < 12) {
                  nextMonth = month + 1
                } else {
                  nextMonth = 1
                  nextYear += 1
                }
                let end = new Date(nextYear + '-' + nextMonth + '-1 0:0:0')
                end.setTime(end.getTime() - 1000)
                return [start, end]
              }
            },
            {
              text: '最近3个月',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            }
          ]
        },
        userMap2: [
          {
            user: '柏海旭',
            alias: ['柏海旭', '海旭', 'haixu.bo', '“haixu.bo”', 'haixu.bo@zhaopin.com.cn', '“haixu.bo@zhaopin.com.cn”']
          },
          {
            user: '王悦',
            alias: ['王悦', '1yue.wang', '“1yue.wang”', '1yue.wang@zhaopin.com.cn', '“1yue.wang@zhaopin.com.cn”']
          },
          {
            user: '袁祝萍',
            alias: ['袁祝萍', '祝萍', 'zhuping.yuan', '“zhuping.yuan”', 'zhuping.yuan@zhaopin.com.cn', '“zhuping.yuan@zhaopin.com.cn”']
          },
          {
            user: '王建新',
            alias: ['王建新', '建新', 'jianxin.wang', '“jianxin.wang”', 'jianxin.wang@zhaopin.com.cn', '“jianxin.wang@zhaopin.com.cn”']
          },
          {
            user: '赵明霞',
            alias: ['赵明霞', '明霞', 'minxia.zhao', '“minxia.zhao”', 'minxia.zhao@zhaopin.com.cn', '“minxia.zhao@zhaopin.com.cn”']
          },
          {
            user: '李增强',
            alias: ['李增强', '增强', 'zengqiang.li', '“zengqiang.li”', 'zengqiang.li@zhaopin.com.cn', '“zengqiang.li@zhaopin.com.cn”']
          },
          {
            user: '王乾',
            alias: ['王乾', 'wang.wq', '“wang.wq”', 'wang.wq@zhaopin.com.cn', '“wang.wq@zhaopin.com.cn”']
          },
          {
            user: '梁山',
            alias: ['梁山', 'liang.shan', '“liang.shan”', 'liang.shan@zhaopin.com.cn', '“liang.shan@zhaopin.com.cn”']
          }
        ],
        userMap: {
          '柏海旭': ['柏海旭', '海旭', 'haixu.bo', '“haixu.bo”', 'haixu.bo@zhaopin.com.cn', '“haixu.bo@zhaopin.com.cn”'],
          '王悦': ['王悦', '1yue.wang', '“1yue.wang”', '1yue.wang@zhaopin.com.cn', '“1yue.wang@zhaopin.com.cn”'],
          '袁祝萍': ['袁祝萍', '祝萍', 'zhuping.yuan', '“zhuping.yuan”', 'zhuping.yuan@zhaopin.com.cn', '“zhuping.yuan@zhaopin.com.cn”'],
          '王建新': ['王建新', '建新', 'jianxin.wang', '“jianxin.wang”', 'jianxin.wang@zhaopin.com.cn', '“jianxin.wang@zhaopin.com.cn”'],
          '赵明霞': ['赵明霞', '明霞', 'minxia.zhao', '“minxia.zhao”', 'minxia.zhao@zhaopin.com.cn', '“minxia.zhao@zhaopin.com.cn”'],
          '李增强': ['李增强', '增强', 'zengqiang.li', '“zengqiang.li”', 'zengqiang.li@zhaopin.com.cn', '“zengqiang.li@zhaopin.com.cn”'],
          '王乾': ['王乾', 'wang.wq', '“wang.wq”', 'wang.wq@zhaopin.com.cn', '“wang.wq@zhaopin.com.cn”'],
          '梁山': ['梁山', 'liang.shan', '“liang.shan”', 'liang.shan@zhaopin.com.cn', '“liang.shan@zhaopin.com.cn”']
        }
      }
    },
    created () {
      this.listRepositories()
      let date = this.getThisWeekDate()
      this.generateDate = date
      this.generateFormData.date = date.map(item => item.getTime())
    },
    methods: {
      getThisWeekDate () {
        let now = new Date()
        let start = new Date()
        let end = new Date()
        var weekday = now.getDay() || 7 // 获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
        start.setDate(now.getDate() - weekday + 1) // 往前算（weekday-1）天，年份、月份会自动变化
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(0)
        end.setTime(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000)
        return [start, end];
      },
      listRepositories () {
        this.$exec({
          action: 'list-repositories'
        })
      },
      setInputManually (flag) {
        this.inputManually = flag
      },
      changeRepoUrl () {
        if (!this.inputManually) {
          // 用户没手动输入过仓库名称，则自动生成
          this.generateFormData.name = this.generateFormData.url.split('/').pop()
        }
      },
      changeRepository (repo) {
        if (repo.value !== 'default') {
          this.generateFormData.name = repo.label
          this.generateFormData.url = repo.value
        } else {
          this.generateFormData.name = ''
          this.generateFormData.url = ''
        }
      },
      generate () {
        // 生成周报
        this.generateFormData.date = this.generateDate.map(item => item.getTime())
        this.isGenerating = true
        this.$exec({
          action: 'generate',
          data: this.generateFormData
        })
        this.currentRepo = JSON.parse(JSON.stringify(this.generateFormData))
        this.setInputManually(false)
      },
      getName (name) {
        let userMap = JSON.parse(JSON.stringify(this.userMap))
        let outName = name
        for (let k in userMap) {
          if (userMap.hasOwnProperty(k)) {
            if (userMap[k].indexOf(name) > -1) {
              outName = k
            }
          }
        }
        return outName
      },
      formatCommitInfo (info) {
        let outInfo = {}
        let i = 0
        for (i; i < info.length; i++) {
          let name = this.getName(info[i].author.name)
          if (!outInfo.hasOwnProperty(name)) {
            outInfo[name] = []
          }
          outInfo[name].push(Object.assign({}, info[i], {
            author: {
              name: info[i].author.name.replace(/["'”“’‘]/g, ''),
              email: info[i].author.email.replace(/["'”“’‘]/g, '')
            }
          }))
        }
        return outInfo
      }
    }
  }
</script>

<style lang="less" scoped>
  @import url("../themes/index.less");
  .generate-container {
    width: 100%;
    height: 100%;
    .generate-header {
      width: 100%;
      height: 64px;
      padding: 10px 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: center;
      color: #ffffff;
      background-color: @primary-color;
      font-size: 18px;
      user-select: none;
    }
    .generate-content {
      width: 100%;
      height: calc(100% - 64px);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      .generate-inner {
        width: 1000px;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        .generate-form {
          width: 440px;
          height: 100%;
          padding: 30px 10px 30px 0;
          box-sizing: border-box;
          input {
            font-size: 18px !important;
          }
          .option-item {
            width: 100%;
            font-size: 14px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            .option-item-name {
              flex: 1;
              padding-right: 15px;
              font-weight: bold;
            }
            .option-item-url {
              max-width: 400px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: #bbb;
              display: inline-block;
              vertical-align: middle;
            }
          }
        }
        .generate-result {
          width: 550px;
          height: 100%;
          padding: 30px 0 30px 10px;
          box-sizing: border-box;
          position: relative;
          .generate-result-inner {
            width: 100%;
            height: 100%;
            border: 1px solid #3f3f3f20;
            // background-color: #3f3f3f;
            box-sizing: border-box;
            border-radius: 5px;
            overflow-y: hidden;
            .generate-result-loading {
              position: absolute;
              width: 100%;
              height: 100%;
              left: 0;
              top: 0;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
            }
            .generate-result-empty {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              color: #c8c8c8;
            }
            .generate-result-content {
              width: 100%;
              height: 100%;
              // border: 1px solid #3f3f3f80;
              // background-color: #3f3f3f;
              // box-sizing: border-box;
              // border-radius: 5px;
              // overflow-y: hidden;
              .generate-result-content-header {
                width: 100%;
                height: 48px;
                padding: 0 15px;
                box-sizing: border-box;
                cursor: pointer;
                background-color: #f8f8f8;
                box-shadow: 0 1px 8px 0px #c8c8c8;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                .generate-result-content-header-name {
                  max-width: 500px;
                  min-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: inline-block;
                  color: #555555;
                  font-size: 18px;
                  padding-right: 15px;
                  font-weight: bold;
                  white-space: nowrap;
                }
                .generate-result-content-header-url {
                  max-width: 400px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  color: #bbb;
                  display: inline-block;
                  vertical-align: middle;
                }
              }
              .generate-result-content-body {
                width: 100%;
                height: calc(100% - 48px);
                padding: 20px 10px 10px 10px;
                box-sizing: border-box;
                overflow-y: auto;
                .content-item {
                  width: 100%;
                  margin-bottom: 10px;
                  .content-item-header {
                    width: 100%;
                    height: 20px;
                    border-left: 6px solid @primary-color;
                    padding-left: 16px;
                    margin: 20px 0;
                    box-sizing: border-box;
                    color: #282828;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: flex-start;
                    .content-item-header-name {
                      font-size: 14px;
                    }
                    .content-item-header-email {
                      font-size: 13px;
                      margin-left: 20px;
                      color: #9e9e9e;
                    }
                  }
                  .content-item-body {
                    .content-item-body-item {
                      padding: 0 10px;
                      color: #666666;
                      font-size: 14px;
                      word-break: break-all;
                      margin: 10px 0;
                      display: flex;
                      flex-direction: row;
                      align-items: flex-start;
                      justify-content: flex-start;
                      .body-item-index {
                        width: 25px;
                      }
                      .body-item-content {
                        flex: 1;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>