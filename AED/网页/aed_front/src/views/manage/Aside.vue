<template>
  <el-aside style="overflow: hidden;">
    <el-menu>
      <img class="aside_logo" :src="require('../../assets/img/logo-2.png')">
      <router-link to="/device">
        <el-menu-item index="1" class="el-icon-manage">
          <span class="data-manage">设备信息</span>
        </el-menu-item>
      </router-link>
      <router-link to="/map">
        <el-menu-item index="2" class="el-icon-map">
          <span class="data-address">位置信息</span>
        </el-menu-item>
      </router-link>
      <router-link to="/warn">
        <el-menu-item index="5" class="el-icon-map">
          <span class="data-address">报警信息</span>
        </el-menu-item>
      </router-link>
      <!--        <router-link to="/curve">-->
      <!--          <el-menu-item index="4" class="el-icon-map">-->
      <!--            <span class="data-address">信息曲线</span>-->
      <!--          </el-menu-item>-->
      <!--        </router-link>-->
      <router-link to="/manager">
        <el-menu-item index="3" class="el-icon-map">
          <span class="data-address">管理人员</span>
        </el-menu-item>
      </router-link>
      <el-submenu index="4">
        <template slot="title" >
          <span class="data-open">开锁记录</span>
        </template>
        <el-menu-item-group class="el-menu-index5">
          <router-link to="/managerOpen">
            <el-menu-item index="1-1">
              <span class="data-managerOpen">管理员</span>
            </el-menu-item>
          </router-link>
          <router-link to="/userOpen">
            <el-menu-item index="1-2">
              <span class="data-managerOpen">普通用户</span>
            </el-menu-item>
          </router-link>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: 'Aside',
  data() {
    return {
      formInline: "",
    }
  }
}
</script>

<style>
@import "../../assets/css/aside";
a{
  text-decoration: none;
  color: #42b983;
}
</style>