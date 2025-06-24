<template>
  <div class="login">
    <el-form :model="user" class="form_login">
      <img class="return_front" @click="returnToFront()" src="../assets/img/return.png">
      <h3>Register</h3>
      <el-form-item label="账号" prop="name" class="form_input">
        <el-input
            type="text"
            placeholder="请输入用户名"
            v-model="user.name"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pwd" class="form_input" style="margin-top: 20px;">
        <el-input
            type="text"
            placeholder="请输入密码"
            show-password
            v-model="user.pwd"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" autocomplete="off" @click="register()" class="btn_login" style="font-size: 20px;">
          注册
        </el-button>
      </el-form-item>
      <div class="create">
        <span>已有账号，去</span>
        <a href="/login" style="color: white;">登陆</a>
      </div>
    </el-form>
  </div>
</template>
<script>
import request from "@/utils/request";
import LoginService from "@/api/login";

export default {
  name: 'Register',
  data() {
    return {
      user: {}
    }
  },
  methods: {
    returnToFront() {
      this.$router.push("/");
    },
    register() {
      LoginService.register(this.user).then(res => {
        console.log(this.user)
        if (res.code === 200) {
          localStorage.setItem("user", this.user.name);
          this.$router.push("/login")
          this.$message.success("注册成功")
        } else {
          this.$message.warning("注册失败")
        }
      })
    }
  }
}
</script>
<style scoped>
@import url(../assets/css/login.css);
</style>