<template>
  <div class="baidumap" id="allmap">
  </div>
</template>
<script>
import request from "@/utils/request"

export default {
  name: 'Map',
  data() {
    return {
      positions: [],
      show1: true,
      show2: true
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      request.get("/device", {}).then(res => {
        this.positions = res.data.slice(0, 10);
        console.log(this.positions);
        this.baiduMap();
      })
    },
    baiduMap() {
      var Map = new BMap.Map('allmap'); // 创建地图实例
      Map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
      Map.addControl(new BMap.NavigationControl());
      Map.addControl(new BMap.ScaleControl());
      Map.addControl(new BMap.OverviewMapControl());
      Map.addControl(new BMap.MapTypeControl());
      // map.setMapStyle({ style: 'midnight' }) //地图风格


      // map.clearOverlays();
      //将数据遍历
      //自定义信息窗口内容
      this.positions.forEach(position => {
        // 创建点坐标
        var point = new BMap.Point(position.lon, position.lat);

        // 创建标记
        var marker = new BMap.Marker(point);

        // 添加标记到地图
        Map.addOverlay(marker);

        var openTestText = (position.openTest === 1) ? '是' : '否';
        // 创建信息窗口内容
        var sContent =
            '<div style="width:200px;"><p style="font-size:16px;font-weight:bold;margin-top: 10px;color:#D07852">' +
            position.deviceId +
            '</p><p style="font-size:13px;margin: 5px 0;">坐标：' +
            position.lon + ',' + position.lat +
            '</p><p style="font-size:13px;margin: 5px 0;">使用次数：' +
            position.countTest +
            '</p><p style="font-size:13px;margin: 5px 0;">电量：' +
            position.powerTest +
            '</p><p style="font-size:13px;margin: 5px 0;">是否开锁：' +
            openTestText +
            '</p><p style="font-size:13px;margin: 5px 0;">光照强度：' +
            position.lux +
            '</p></div>';

        // 创建信息窗口
        var infoWindow = new BMap.InfoWindow(sContent);

        // 点击标记时显示对应的信息窗口
        marker.addEventListener('click', function () {
          this.openInfoWindow(infoWindow);
        });
        // 设置地图中心和缩放级别
        Map.centerAndZoom(point, 15);
        // //点击图标时候调用信息窗口
        var infoWindow = new BMap.InfoWindow(sContent);
        marker.openInfoWindow(infoWindow);

        marker.addEventListener('click', function () {
          this.openInfoWindow(infoWindow);
        })
      });


    }
  }
}
</script>
<style scoped>
.baidumap {

  width: 1000px;
  height: 600px;
  border: 10px solid rgb(0, 0, 0);
  margin-left: 40px;
  border-radius: 15px;

}

/* 去除百度地图版权那行字 和 百度logo */
/deep/ .baidumap > .BMap_cpyCtrl {
  display: none !important;
}

/deep/ .baidumap > .anchorBL {
  display: none !important;
}

</style>
