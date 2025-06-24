<template>
  <div>
    <el-dialog width="40%" :title="diaTitle" :visible.sync="dialogVisb" @close="handleClose">
      <el-form :model="data" label-width="80px">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="设备id">
              <el-input v-model="data.deviceId" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="经度">
              <el-input v-model="data.lon" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="纬度">
              <el-input v-model="data.lat" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="俯仰角">
              <el-input v-model="data.pitch" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="翻滚角">
              <el-input v-model="data.roll" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="航向角">
              <el-input v-model="data.yaw" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="设备电量">
              <el-input v-model="data.powerTest" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="使用次数">
              <el-input v-model="data.countTest" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="非法开锁">
              <el-input v-model="data.warning" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="text-align: right">
        <el-button type="primary" @click="handleClose">取消</el-button>
        <el-button type="primary" @click="save()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import DeviceService from "@/api/deviceService";
export default {
  name: "AddUser",
  props: {
    type: String,
    deviceId: String,
    dialogFormVisible: Boolean,
  },
  data() {
    return {
      diaTitle: '',
      disableOrNot: '',
      data: {},
      isEdit: false,
    }
  },
  watch: {
    type: {
      handler(newval, oldval) {
        if (newval === 'add') {
          this.diaTitle = '新增'
          this.disableOrNot = false
        }
        if (newval === 'edit') {
          this.diaTitle = '编辑'
          this.disableOrNot = false
        }
        if (newval === 'detail') {
          this.diaTitle = '详情';
          this.isEdit = true;
          this.disableOrNot = true
        }
      },
      immediate: true,
    },
    deviceId: {
      handler(newval, oldval) {
        if (newval) {
          DeviceService.findById(newval).then((res) => {
            console.log(res);
            this.data = res.data;
          })
        }
      },
      immediate: true,
    },
  },
  computed: {
    dialogVisb: {
      get() {
        return this.dialogFormVisible
      },
      set(v) {
        this.$emit('update:dialogFormVisible', v)
      },
    },
  },
  mounted() {
  },
  methods: {
    handleClose() {
      this.data = {}
      this.dialogVisb = false
    },
    save() {
          DeviceService.save(this.data).then(res => {
            if (res.code === 200) {
              this.$message.success("操作成功");
              this.handleClose()
              this.$emit('refresh')
            } else {
              this.$message.warning("操作失败");
              return false;
            }
          })
    }
  }
}
</script>
<style>

</style>
