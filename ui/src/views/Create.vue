<template>
  <div class="generate-container">
    <div class="generate-header">Weekly</div>
    <div class="generate-content">
      <div class="generate-inner">
        <div class="generate-form">
          <Form :label-width="90"
                label-colon
                ref="generateFromRef"
                :model="generateFormData"
                :rules="generateFormRule">
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
                      prop="url">
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
              <Button type="primary"
                      class="ml15"
                      ghost
                      :loading="isSavingRepo"
                      @click="saveRepo">
                <span v-if="!isSavingRepo">保存仓库</span>
                <span v-else>保存中...</span>
              </Button>
            </FormItem>
          </Form>
          <div class="generate-form-bottom">
            <transition name="fade">
              <div class="generate-form-bottom-item"
                   v-if="!showChart"
                   @mouseenter="pdfBtnText = '下载'"
                   @mouseleave="pdfBtnText = 'PDF'"
                   @click="downloadPdf">
                {{pdfBtnText}}
              </div>
            </transition>
            <transition name="fade">
              <div class="generate-form-bottom-item"
                   v-if="Object.keys(commitInfo).length > 0"
                   @click="toggleCommitsType">{{showChart ? '文本' : '图表'}}</div>
            </transition>
          </div>
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
                   v-if="!isGenerating && currentRepo.name && !showChart">
                <Tooltip :content="currentRepo.url"
                         placement="bottom-end"
                         style="width: 100%;">
                  <div class="generate-result-content-header">
                    <div class="generate-result-content-header-name">{{currentRepo.name}}</div>
                    <div class="generate-result-content-header-url">{{currentRepo.url}}</div>
                  </div>
                </Tooltip>
                <div class="generate-result-content-body"
                     id="commit-info-body">
                  <div class="content-item"
                       v-for="(commits, name) in commitInfo"
                       :key="commits[0].commit">
                    <div class="content-item-header">
                      <div class="content-item-header-name">
                        {{name}}
                      </div>
                      <div class="content-item-header-email">
                        <span class="content-item-header-commits-count">{{commits.length}}</span> commits &lt; {{commits[0].author.email}} &gt;
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
                          <span class="body-item-content-date">[{{commit.date}}]</span> {{commit.message.replace(/[\r\n]/g, '')}}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div class="generate-result-content-body"
                     style="width: 100%; height: calc(100% - 48px); padding: 20px 10px 10px 10px; box-sizing: border-box; overflow-y: auto;"
                     id="commit-info-body">
                  <div class="content-item"
                       style="width: 100%; margin-bottom: 10px;"
                       v-for="(commits, name) in commitInfo"
                       :key="commits[0].commit">
                    <div class="content-item-header"
                         style="width: 100%; height: 20px; border-left: 6px solid @primary-color; padding-left: 16px; margin: 20px 0; box-sizing: border-box; color: #282828; display: flex; flex-direction: row; align-items: center; justify-content: flex-start;">
                      <div class="content-item-header-name"
                           style="font-size: 14px;">
                        {{name}}
                      </div>
                      <div class="content-item-header-email"
                           style="font-size: 13px; margin-left: 20px; color: #9e9e9e;">
                        &lt; {{commits[0].author.email}} &gt;
                      </div>
                    </div>
                    <div class="content-item-body">
                      <div class="content-item-body-item"
                           style="padding: 0 10px 0 0; color: #666666; font-size: 14px; word-break: break-all; margin: 10px 0; display: flex; flex-direction: row; align-items: flex-start; justify-content: flex-start;"
                           v-for="(commit, index) in commits"
                           :key="commit.commit">
                        <div class="body-item-index"
                             style="width: 30px; white-space: nowrap; text-align: right; margin-right: 8px;">
                          {{index + 1}}.
                        </div>
                        <div class="body-item-content"
                             style="flex: 1;">
                          {{commit.message.replace(/[\r\n]/g, '')}}
                        </div>
                      </div>
                    </div>
                  </div>
                </div> -->
              </div>
            </transition>
            <transition name="fade">
              <div class="result-chart"
                   v-if="!isGenerating && currentRepo.name && showChart">
                <log-chart :commits="commitInfo"></log-chart>
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
      Input, Modal, Button, Form, FormItem, Select, Option, Spin, DatePicker,
      LogChart: () => import('../components/LogChart')
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
      },
      'SAVE_REPO' (data) {
        if (data.status === 0) {
          this.$Message.error(data.message)
        } else {
          this.repositories.push({
            name: data.name,
            url: data.url
          })
          this.$Message.success(data.message)
        }
        this.isSavingRepo = false
      },
      'CREATE_PDF' (data) {
        this.pdfGenerating = false
        console.log(Object.prototype.toString.call(data.data), data.data)
        if (this.messageLoading) {
          setTimeout(this.messageLoading, 200)
          setTimeout(() => {
            this.$Message.success('PDF 生成成功')
          }, 300)
          this.messageLoading = null
        }
      }
    },
    data () {
      return {
        repositories: [],
        isGenerating: false, // 正在生成周报
        isSavingRepo: false, // 正在保存仓库
        generateDate: [],
        inputManually: false, // 是否手动输入的仓库名称
        activeRepo: 'default', // 自定义仓库
        generateProgress: 0, // 周报生成进度
        commitInfo: {}, // 周报内容
        currentRepo: {}, // 当前仓库信息
        generateFormData: {
          name: '',
          url: '',
          username: '',
          password: '',
          date: []
        },
        generateFormRule: {
          url: [
            {
              required: true,
              message: '请输入仓库地址',
              trigger: 'blur'
            }
          ]
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
            },
            {
              text: '最近6个月',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 2 * 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            },
            {
              text: '最近1年',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 2 * 2 * 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            },
            {
              text: '最近2年',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 2 * 2 * 2 * 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            },
            {
              text: '最近3年',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3 * 2 * 2 * 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            }
          ]
        },
        userMap: {
          '柏海旭': ['柏海旭', '海旭', 'bohaixu', 'haixu.bo', '“haixu.bo”', 'haixu.bo@zhaopin.com.cn', '“haixu.bo@zhaopin.com.cn”'],
          '王悦': ['王悦', 'wangyue', '1yue.wang', '“1yue.wang”', '1yue.wang@zhaopin.com.cn', '“1yue.wang@zhaopin.com.cn”'],
          '袁祝萍': ['袁祝萍', '祝萍', 'yuanzhuping', 'zhuping.yuan', '“zhuping.yuan”', 'zhuping.yuan@zhaopin.com.cn', '“zhuping.yuan@zhaopin.com.cn”'],
          '王建新': ['王建新', '建新', 'wangjianxin', 'jianxin.wang', '“jianxin.wang”', 'jianxin.wang@zhaopin.com.cn', '“jianxin.wang@zhaopin.com.cn”'],
          '赵明霞': ['赵明霞', '明霞', 'zhaominxia', 'mxzhao', 'minxia.zhao', '“minxia.zhao”', 'minxia.zhao@zhaopin.com.cn', '“minxia.zhao@zhaopin.com.cn”'],
          '李增强': ['李增强', '增强', 'lizengqiang', 'zengqiang.li', '“zengqiang.li”', 'zengqiang.li@zhaopin.com.cn', '“zengqiang.li@zhaopin.com.cn”'],
          '王乾': ['王乾', 'wangqian', 'wang.wq', '“wang.wq”', 'wang.wq@zhaopin.com.cn', '“wang.wq@zhaopin.com.cn”'],
          '梁山': ['梁山', 'liangshan', 'liang.shan', '“liang.shan”', 'liang.shan@zhaopin.com.cn', '“liang.shan@zhaopin.com.cn”']
        },
        showChart: true, // 显示图表
        pdfGenerating: false, // 正在生成pdf
        messageLoading: null,
        pdfBtnText: 'PDF'
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
        this.isGenerating = true
        this.$refs.generateFromRef.validate(valid => {
          if (valid) {
            this.generateFormData.date = this.generateDate.map(item => item.getTime())
            this.$exec({
              action: 'generate',
              data: this.generateFormData
            })
            this.currentRepo = JSON.parse(JSON.stringify(this.generateFormData))
            this.setInputManually(false)
          } else {
            this.isGenerating = false
            this.$Message.error('表单填写不正确!')
          }
        })
      },
      saveRepo () {
        this.isSavingRepo = true
        this.$refs.generateFromRef.validate(valid => {
          if (valid) {
            this.generateFormData.date = this.generateDate.map(item => item.getTime())
            this.$exec({
              action: 'save-repo',
              data: this.generateFormData
            })
          } else {
            this.isSavingRepo = false
            this.$Message.error('表单填写不正确!')
          }
        })
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
      },
      toggleCommitsType () {
        this.showChart = !this.showChart
      },
      downloadPdf () {
        if (this.pdfGenerating) return
        if (this.messageLoading) {
          setTimeout(this.messageLoading, 1)
          this.messageLoading = null
        }
        this.messageLoading = this.$Message.loading({
          content: '正在生成pdf...',
          duration: 0
        })
        this.pdfGenerating = true
        this.$exec({
          action: 'create-pdf',
          data: {
            html: document.querySelector('#commit-info-body').outerHTML
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import url("../themes/index.less");
  .ml15 {
    margin-left: 15px;
  }
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
          position: relative;
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
          .generate-form-bottom {
            width: 32px;
            position: absolute;
            right: -15px;
            bottom: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            .generate-form-bottom-item {
              width: 32px;
              height: 32px;
              background-color: #282828;
              margin-top: 5px;
              border-radius: 4px;
              color: #c8c8c8;
              cursor: pointer;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
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
            position: relative;
            width: 100%;
            height: 100%;
            border: 1px solid #3f3f3f20;
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
                    height: 30px;
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
                      font-size: 18px;
                      font-weight: bold;
                    }
                    .content-item-header-email {
                      height: 30px;
                      font-size: 14px;
                      margin-left: 20px;
                      color: #888888;
                      display: flex;
                      flex-direction: row;
                      align-items: flex-end;
                      .content-item-header-commits-count {
                        color: #333333;
                        font-size: 16px;
                        margin-right: 5px;
                      }
                    }
                  }
                  .content-item-body {
                    .content-item-body-item {
                      padding: 0 10px 0 0;
                      color: #333333;
                      font-size: 14px;
                      word-break: break-all;
                      margin: 10px 0;
                      display: flex;
                      flex-direction: row;
                      align-items: flex-start;
                      justify-content: flex-start;
                      .body-item-index {
                        width: 30px;
                        white-space: nowrap;
                        text-align: right;
                        margin-right: 8px;
                      }
                      .body-item-content {
                        flex: 1;
                        .body-item-content-date {
                          color: #888888;
                        }
                      }
                    }
                  }
                }
              }
            }
            .result-chart {
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
          }
        }
      }
    }
  }
</style>