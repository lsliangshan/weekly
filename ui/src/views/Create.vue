<template>
  <div class="generate-container">
    <div class="generate-header">Weekly 周报生成器</div>
    <div class="generate-content">
      <div class="generate-inner">
        <div class="generate-form">
          <Form :label-width="80"
                :model="generateFormData">
            <FormItem label="仓库地址">
              <Input placeholder="请输入仓库地址"
                     v-model="generateFormData.url" />
            </FormItem>
            <FormItem label="仓库账号">
              <Input placeholder="请输入仓库账号"
                     v-model="generateFormData.username" />
            </FormItem>
            <FormItem label="仓库密码">
              <Input placeholder="请输入仓库密码"
                     v-model="generateFormData.password" />
            </FormItem>
            <FormItem label="时间">
              <DatePicker type="daterange"
                          :options="reportDateOptions"
                          placement="bottom-end"
                          placeholder="请选择起止时间"
                          style="width: 100%;"></DatePicker>
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
      generateFormData: {
        name: '',
        url: '',
        username: '',
        password: ''
      },
      reportDateOptions: {
        shortcuts: [
          {
            text: '本周',
            value () {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: '本月',
            value () {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
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
    listRepositories () {
      this.$exec({
        action: 'list-repositories'
      })
    },
    generate () {
      // 生成周报
      this.$exec({
        action: 'generate',
        data: this.generateFormData
      })
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
      }
      .generate-result {
        width: 600px;
        height: 100%;
        padding: 30px 0 30px 10px;
        box-sizing: border-box;
        background-color: goldenrod;
      }
    }
  }
}
</style>