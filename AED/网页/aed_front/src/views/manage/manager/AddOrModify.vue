<template>
  <div>
    <el-dialog width="40%" :title="diaTitle" :visible.sync="dialogVisb" @close="handleClose">
      <el-form :model="data" label-width="80px">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="姓名">
              <el-input v-model="data.name" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="密码">
              <el-input v-model="data.pwd" :disabled="isEdit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="手机号">
              <el-input v-model="data.phone" :disabled="isEdit"></el-input>
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
import UserService from "@/api/userService";
export default {
  name: "AddUser",
  props: {
    type: String,
    managerId: String,
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
    managerId: {
      handler(newval, oldval) {
        if (newval) {
          UserService.findById(newval).then((res) => {
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
          UserService.save(this.data).then(res => {
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
