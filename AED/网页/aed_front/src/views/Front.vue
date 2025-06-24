<template>
  <div class="contianer">
    <div class="front">
    <el-menu
    class="el-menu-front"
    mode="horizontal"
    background-color="rgba(0,0,0,0)"
    text-color="#fff"
    active-text-color="#ffd04b">
        <img class="logo" src="../assets/img/logo-3.png">
        <el-menu-item index="1" class="el-menu-item">网站首页</el-menu-item>
        <el-menu-item index="2" class="el-menu-item" @click="scrollToAbout()">关于我们</el-menu-item>
        <el-menu-item index="3" class="el-menu-item" @click="scrollToSolve()">解决方案</el-menu-item>
        <el-menu-item index="4" class="el-menu-item">服务</el-menu-item>
        <el-menu-item index="5" class="el-menu-item">产品</el-menu-item>
        <el-menu-item index="6" class="el-menu-item" @click="toLogin()">登陆/注册</el-menu-item>
    </el-menu>
    <h1>AED</h1>
     <!-- <video class="front" preload="auto" loop playsinline autoplay src="../assets/img/back2.jpg" tabindex="-1" muted="muted"></video> -->
    </div>
    <img class="about_img" src="../assets/img/about.png">
    <div class="about" id="about">
      <h2>智能AED导航系统</h2>
      <h3>Intelligent AED navigation system</h3>
      <p>随着社会经济的不断发展，全球老年人口数不断上升，而心脏疾病也成为了世界范围内的主要健康挑战之一。其中心脏骤停是一种突发性的心脏状况，如果不及时处理，可能导致致命后果，因此，急救措施的迅速实施对于拯救生命至关重要。本项目针对以上现象，设计了配备人脸识别解锁系统、微信小程序和网站管理平台的智能AED除颤箱。使用人脸识别系统进行AED开锁控制，减少了开箱时间，防止盗窃事件发生，提高了救援效率。微信小程序对每个AED进行定位显示和路径规划，预防突发情况无法找到设备，延误救援时间。管理平台用于管理人员对AED除颤箱的监管和控制，及时进行维修操作，提高了管理效率，降低因抢救不及而造成死亡的概率。建立自动体外除颤器地图、自动体外除颤器导航，为公众提供更加准确的自动体外除颤器地理位置服务，保障了城市居民的安全</p>
    </div>
    <div class="solve" id="solve"> 
      <dl class="front_first">
      <h4>关于AED</h4>
      <dt>网站首页</dt>
      <dt>解决方案</dt>
      <dt>项目内容</dt>
      <dt>项目功能</dt>
      <dt>项目服务</dt>
      </dl>
      <dl class="front_first">
      <h4>关于AED</h4>
      <dt>网站首页</dt>
      <dt>解决方案</dt>
      <dt>项目内容</dt>
      <dt>项目功能</dt>
      <dt>项目服务</dt>
      </dl>
      <dl class="front_first">
      <h4>关于AED</h4>
      <dt>网站首页</dt>
      <dt>解决方案</dt>
      <dt>项目内容</dt>
      <dt>项目功能</dt>
      <dt>项目服务</dt>
      </dl>
      <img class="solute_img" src="../assets/img/solute.png">
    </div>
  </div>
</template>

<script>

export default {
  name: 'Front',
  components: {
    
  },
  methods:{
    scrollToAbout(){
      document.getElementById('about').scrollIntoView({
            block: 'start',
            inline: 'nearest',
            behavior: 'smooth'
        })
    },
    scrollToSolve(){
      document.getElementById('solve').scrollIntoView({
            block: 'start',
            inline: 'nearest',
            behavior: 'smooth'
        })
    },
    toLogin(){
      this.$router.push("/login");
    }
  }
}
</script>
<style scoped>
@import "../assets/css/front\ .css";
</style>
