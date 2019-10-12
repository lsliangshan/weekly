<template>
  <div class="generate-container">
    <div class="generate-header">Weekly</div>
    <div class="generate-content">
      <div class="generate-inner">
        <div class="generate-form">
          <Form :label-width="75"
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
            <FormItem label="仓库地址">
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
        <div class="generate-result"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Tooltip, Icon, Poptip, Switch, Input, Modal, Button, Form, FormItem, Select, Option, Spin, DatePicker } from 'iview'
  export default {
    name: 'Create',
    components: {
      Tooltip, Icon, Poptip,
      iSwitch: Switch,
      Input, Modal, Button, Form, FormItem, Select, Option, Spin, DatePicker
    },
    sockets: {
      'LIST_REPOSITORIES' (data) {
        this.repositories = data.repositories
      }
    },
    data () {
      return {
        repositories: [],
        isGenerating: false, // 正在生成周报
        generateDate: [],
        inputManually: false, // 是否手动输入的仓库名称
        activeRepo: 'default', // 自定义仓库
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
        }
      }
    },
    created () {
      this.listRepositories()
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
        setTimeout(() => {
          this.isGenerating = false
        }, 3000)
        // this.$exec({
        //   action: 'generate',
        //   data: this.generateFormData
        // })
        this.setInputManually(false)
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
          width: 400px;
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
          width: 600px;
          height: 100%;
          padding: 30px 0 30px 10px;
          box-sizing: border-box;
          background-color: lightcyan;
        }
      }
    }
  }
</style>