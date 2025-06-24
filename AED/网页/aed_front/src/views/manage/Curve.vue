<template>
  <el-form>
    <div style="margin-top: 150px">
      <ve-line :data="chartData" :settings="chartSettings"></ve-line>
    </div>
  </el-form>
</template>
<script>
import VeLine from 'v-charts/lib/line'
import request from "@/utils/request";

export default {
  name: 'Curve',
  components: {VeLine},
  data() {
    return {
      chartData: {
        columns: ['deviceId', 'powerTest'],
        rows: [
          {
            'powerTest': 2,
            // 'countTest': 11,
            // '电能2': 2,
            // '电能3': 0.5,
            // '电能4': 0.63,
            // '电能5': 0.8,
            // '电能6': 2,
            // '电能7': 2.1,
            // '电能8': 1.7
          },
          // {
          //   '日期': '10月5日',
          //   '电能1': 3.8,
          //   '电能2': 6.2,
          //   '电能3': 6.4,
          //   '电能4': 4.5,
          //   '电能5': 4.5,
          //   '电能6': 6.5,
          //   '电能7': 7.1,
          //   '电能8': 5.5
          // },
        ]
      },
      chartSettings: {
        yAxisName: ['信息曲线图']
      },
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      request.get("/device/searchAllPowerTest", {}).then(res => {
        const device = res.data.slice(-10);
        // 使用 map 方法遍历数组，进行属性重命名
        this.rows = device.map(obj => {
          const { openTest: oldValue, ...rest } = obj; // 解构每个对象的 openTest 值，并保存剩余的属性
          return { "openTest": oldValue, ...rest }; // 重新构建新的对象，属性名为 "openTest"
        });
        console.log(this.rows)
      })
    },
  },
}
</script>
<style scoped>
</style>