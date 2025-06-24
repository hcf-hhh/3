<template>
  <div>
    <el-container>
      <el-aside>
        <Aside></Aside>
      </el-aside>
      <el-container>
        <el-header style="text-align: right; font-size: 10px;background-color: white">
          <el-dropdown trigger="click">
            <i class="el-icon-setting" style="margin-top: 15px;font-size: 20px;margin-right: 15px;color:#000"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="logout()">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span style="margin-top: 15px;font-size: 20px">{{ name }}</span>
        </el-header>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Aside from "./Aside.vue";

export default {
  name: 'Main',
  components: {Aside},
  data() {
    return {
      name: '',
    }
  },
  mounted() {
    this.getMessage();
  },
  methods: {
    getMessage() {
      console.log(this.name)
      this.name = localStorage.getItem('user');
    },
    logout() {
      this.$router.push("/login");
      this.$message.success("操作成功");
    }
  }
}
</script>
<style>
@import "../../assets/css/main.css";
</style>
  