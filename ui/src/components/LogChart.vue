<template>
  <div class="log-chart-containner"
       ref="logChartContainer">
    <div id="log-chart">
    </div>

    <div class="chart-type-toggle"
         @click="toggleChartType">
      <Tooltip content="切换图表类型"
               placement="left">
        <svg>
          <use :xlink:href="'#chart-' + (type === 'pie' ? 'column': 'pie')"></use>
        </svg>
      </Tooltip>
    </div>
  </div>
</template>

<script>
import { Tooltip } from 'view-design'
import G2 from '@antv/g2'
G2.Global.renderer = 'svg'
export default {
  name: 'LogChart',
  components: {
    Tooltip
  },
  props: {
    commits: {
      type: Object,
      default () {
        return {} || {
          "Sindre Sorhus": [
            {
              "commit": "4de1841129cf3d0a1db7a5d6638402b7828e1731",
              "author": {
                "name": "Sindre Sorhus",
                "email": "sindresorhus@gmail.com"
              },
              "date": "2019-10-08 17:21:40",
              "message": "3.0.0-beta.2\n"
            },
            {
              "commit": "48905d08052aad4c8ba53bbd9fbcd8a9faf4f6e5",
              "author": {
                "name": "Sindre Sorhus",
                "email": "sindresorhus@gmail.com"
              },
              "date": "2019-09-27 13:07:07",
              "message": "3.0.0-beta.1\n"
            },
            {
              "commit": "1953816afd7d36e0a6751331a0441822477313b8",
              "author": {
                "name": "Sindre Sorhus",
                "email": "sindresorhus@gmail.com"
              },
              "date": "2019-09-27 12:16:49",
              "message": "Update dependencies\n"
            }
          ],
          "Mark Pedrotti": [
            {
              "commit": "fb8e85ab875eb95b55448fd615daacf8c325cf44",
              "author": {
                "name": "Mark Pedrotti",
                "email": "pedrottimark@gmail.com"
              },
              "date": "2019-10-08 17:02:34",
              "message": "Add `ansi256` and `bgAnsi256` to TypeScript declarations (#368)\n\n"
            },
            {
              "commit": "eef8c8c191d25deecde8c472e10a37c6f736e2e9",
              "author": {
                "name": "Mark Pedrotti",
                "email": "pedrottimark@gmail.com"
              },
              "date": "2019-10-01 09:13:15",
              "message": "Replace level list with table in readme.md (#367)\n\n* Replace level list with table in readme.md\r\n\r\n* Capitalize table headings and center level numbers\r\n"
            }
          ],
          "Yanis Benson": [
            {
              "commit": "61aca7cb768cc4e3bc5d11abbad32377c72e1ff3",
              "author": {
                "name": "Yanis Benson",
                "email": "yanis.benson@gmail.com"
              },
              "date": "2019-09-27 11:55:19",
              "message": "Improve require speed (#358)\n\n"
            },
            {
              "commit": "2a53389d72cf46dbb9d73ab730d99e15cb230c7f",
              "author": {
                "name": "Yanis Benson",
                "email": "yanis.benson@gmail.com"
              },
              "date": "2019-09-22 17:07:33",
              "message": "Add `chalk.stderr` (#359)\n\n"
            }
          ],
          "Khải": [
            {
              "commit": "4e65299e7bc54949d00ec0c963daf08635d83bc0",
              "author": {
                "name": "Khải",
                "email": "hvksmr1996@gmail.com"
              },
              "date": "2019-09-27 11:53:54",
              "message": "Fix const enum for TypeScript (#364)\n\n"
            }
          ],
          "Simen Bekkhus": [
            {
              "commit": "6b4d20683f7490195e51f80829f3d465b9835de1",
              "author": {
                "name": "Simen Bekkhus",
                "email": "sbekkhus91@gmail.com"
              },
              "date": "2019-08-22 21:28:25",
              "message": "Export TypeScript types for colors and modifiers (#357)\n\nCo-authored-by: Sindre Sorhus <sindresorhus@gmail.com>"
            }
          ],
          "Sindre Sorhus 2": [
            {
              "commit": "4de1841129cf3d0a1db7a5d6638402b7828e1731",
              "author": {
                "name": "Sindre Sorhus",
                "email": "sindresorhus@gmail.com"
              },
              "date": "2019-10-08 17:21:40",
              "message": "3.0.0-beta.2\n"
            },
            {
              "commit": "48905d08052aad4c8ba53bbd9fbcd8a9faf4f6e5",
              "author": {
                "name": "Sindre Sorhus",
                "email": "sindresorhus@gmail.com"
              },
              "date": "2019-09-27 13:07:07",
              "message": "3.0.0-beta.1\n"
            },
            {
              "commit": "1953816afd7d36e0a6751331a0441822477313b8",
              "author": {
                "name": "Sindre Sorhus",
                "email": "sindresorhus@gmail.com"
              },
              "date": "2019-09-27 12:16:49",
              "message": "Update dependencies\n"
            }
          ],
          "Mark Pedrotti 2": [
            {
              "commit": "fb8e85ab875eb95b55448fd615daacf8c325cf44",
              "author": {
                "name": "Mark Pedrotti",
                "email": "pedrottimark@gmail.com"
              },
              "date": "2019-10-08 17:02:34",
              "message": "Add `ansi256` and `bgAnsi256` to TypeScript declarations (#368)\n\n"
            },
            {
              "commit": "eef8c8c191d25deecde8c472e10a37c6f736e2e9",
              "author": {
                "name": "Mark Pedrotti",
                "email": "pedrottimark@gmail.com"
              },
              "date": "2019-10-01 09:13:15",
              "message": "Replace level list with table in readme.md (#367)\n\n* Replace level list with table in readme.md\r\n\r\n* Capitalize table headings and center level numbers\r\n"
            }
          ],
          "Yanis Benson 2": [
            {
              "commit": "61aca7cb768cc4e3bc5d11abbad32377c72e1ff3",
              "author": {
                "name": "Yanis Benson",
                "email": "yanis.benson@gmail.com"
              },
              "date": "2019-09-27 11:55:19",
              "message": "Improve require speed (#358)\n\n"
            },
            {
              "commit": "2a53389d72cf46dbb9d73ab730d99e15cb230c7f",
              "author": {
                "name": "Yanis Benson",
                "email": "yanis.benson@gmail.com"
              },
              "date": "2019-09-22 17:07:33",
              "message": "Add `chalk.stderr` (#359)\n\n"
            }
          ],
          "Khải 2": [
            {
              "commit": "4e65299e7bc54949d00ec0c963daf08635d83bc0",
              "author": {
                "name": "Khải",
                "email": "hvksmr1996@gmail.com"
              },
              "date": "2019-09-27 11:53:54",
              "message": "Fix const enum for TypeScript (#364)\n\n"
            }
          ],
          "Simen Bekkhus 2": [
            {
              "commit": "6b4d20683f7490195e51f80829f3d465b9835de1",
              "author": {
                "name": "Simen Bekkhus",
                "email": "sbekkhus91@gmail.com"
              },
              "date": "2019-08-22 21:28:25",
              "message": "Export TypeScript types for colors and modifiers (#357)\n\nCo-authored-by: Sindre Sorhus <sindresorhus@gmail.com>"
            }
          ]
        }
      }
    }
  },
  data () {
    return {
      parentBox: {},
      data: [],
      chart: null,
      type: 'column' // pie: 饼状图；column: 柱状图
    }
  },
  mounted () {

  },
  methods: {
    initCommits () {
      let data = []
      Object.keys(this.commits).forEach(item => {
        data.push({
          name: item,
          commits: this.commits[item].length
        })
      })
      this.data = JSON.parse(JSON.stringify(data))
    },
    getParentSize () {
      this.$nextTick(() => {
        let parentBox = this.$refs.logChartContainer.getBoundingClientRect()
        this.parentBox = {
          width: parentBox.width,
          height: parentBox.height
        }
      })
    },
    initChartPie () {
      // 饼状图
      this.chart.legend({
        position: 'right-center',
        offsetX: -50
      })
      this.chart.coord('theta', {
        radius: 0.75
      })
      this.chart.intervalStack().position('commits').color('name').style({
        stroke: 'white',
        lineWidth: 1
      }).label('name', val => {
        return {
          offset: -10,
          textStyle: {
            fill: '#1d1e23',
            fontSize: 14,
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)'
          },
          formatter: function formatter (text) {
            return text
          }
        }
      })
    },
    initChartColumn () {
      // 柱状图
      this.chart.scale('commits', {
        alias: '提交次数（次）'
      })
      this.chart.axis('name', {
        label: {
          textStyle: {
            fill: '#aaa'
          }
        },
        tickLine: {
          alignWithLabel: false,
          length: 0
        }
      });
      this.chart.axis('commits', {
        label: {
          textStyle: {
            fill: '#888'
          },
        },
        title: {
          offset: 60
        }
      });
      this.chart.interval().position('name*commits').color('name')

    },
    initChart () {
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.destroy()
        }
        this.chart = new G2.Chart({
          container: 'log-chart',
          width: this.parentBox.width || 530,
          height: this.parentBox.height || 500,
          padding: [50, 'auto', 'auto', 'auto']
        })
        this.chart.source(this.data)
        switch (this.type) {
          case 'column':
            this.initChartColumn()
            break
          case 'pie':
            this.initChartPie()
            break
          default:
            this.initChartColumn()
            break
        }
        this.chart.render()
      })
    },
    toggleChartType () {
      this.type = (this.type === 'pie' ? 'column' : 'pie')
      this.initChart()
    }
  },
  watch: {
    commits: {
      immediate: true,
      handler (val) {
        this.getParentSize()
        this.initCommits()
        this.initChart()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.log-chart-containner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  .chart-type-toggle {
    position: absolute;
    right: 15px;
    top: 15px;
    width: 32px;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    svg {
      width: 24px;
      height: 24px;
      fill: #2b5b5b;
      cursor: pointer;
    }
  }
}
</style>