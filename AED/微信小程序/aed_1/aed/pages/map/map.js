const API = require("../../public/api");
import mqtt from '../../utils/mqtt';
Page({
	data: {
		address:{
			// lat: 35,
			// lon: 129,
		},
		client: null,
    //记录重连的次数
    reconnectCounts: 0,
    //MQTT连接的配置
    options: {
      protocolVersion: 5.0, //MQTT连接协议版本
      clientId: 'mqttx_3d6c83f2',
      clean: true,
      password: 'Jit666666!',
      username: 'admin',
      reconnectPeriod: 4000, //1000毫秒，两次重新连接之间的间隔
      connectTimeout: 10 * 1000, //1000毫秒，两次重新连接之间的间隔
      resubscribe: true //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
    }
	},

  onLoad: function() {
    this.map();
  },
  map: function(){
		wx.request({
			url: API.search,
			header: {
				"content-type": "application/json"
			},
			timeout: 3000,
			method: "GET",
			success: (res) => {
				// 在 success 回调函数中将响应赋给 this.data.test
				this.setData({
					address: res.data.data
				});
				console.log(this.data.address);
				wx.setNavigationBarTitle({
					title: '导航栏标题',
					success: function(res) {
						console.log('设置导航栏标题成功');
					},
					fail: function(err) {
						console.error('设置导航栏标题失败', err);
					}
				});
		
				let key ='OXPBZ-PLU6N-3L4F6-SQIFC-F4W2H-IDB34'; //使用在腾讯位置服务申请的key
				let referer ='智能AED导航系统';  //调用插件的小程序的名称
				let endPoint = JSON.stringify({ //终点
					'name':'AED设备',
					'latitude': this.data.address.lat,
					'longitude': this.data.address.lon
				});
		
				wx.navigateTo({
					url:'plugin://routePlan/route-plan?key=' + key +'&referer=' + referer +'&endPoint=' + endPoint
				});
			}
		
		}); 
	},
	open: function(){
		var that = this;
    //开始连接
    this.data.client = mqtt.connect(`wx://yuetongroad.com:8083/mqtt`, this.data.mqttOptions)
    this.data.client.on('connect', function(connack) {
      // wx.showToast({
      //   title: '连接成功'
      // })
    })
    //服务器下发消息的回调
    that.data.client.on("message", function(topic, payload) {
      console.log(" 收到 topic:" + topic + " , payload :" + payload)
      wx.showModal({
        content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
        showCancel: false,
      });
    })
    //服务器连接异常的回调
    that.data.client.on("error", function(error) {
      console.log(" 服务器 error 的回调" + error)

    })
    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function() {
      console.log(" 服务器 reconnect的回调")

    })
    //服务器连接异常的回调
    that.data.client.on("offline", function(errr) {
      console.log(" 服务器offline的回调")

		})
		if (this.data.client && this.data.client.connected) {
      //仅订阅单个主题
      this.data.client.subscribe('aed', function(err, granted) {
        if (!err) {
          wx.showToast({
            title: '订阅主题成功'
          })
        } else {
          wx.showToast({
            title: '订阅主题失败',
            icon: 'fail',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
		}
		const message='{"id":"1"}';
            this.data.client.publish("aed",message,{qos : 2})
            wx.showToast({
							title: '开锁成功'
						})
	},
	close: function(){
		var that = this;
    //开始连接
    this.data.client = mqtt.connect(`wx://yuetongroad.com:8083/mqtt`, this.data.mqttOptions)
    this.data.client.on('connect', function(connack) {
      // wx.showToast({
      //   title: '连接成功'
      // })
    })
    //服务器下发消息的回调
    that.data.client.on("message", function(topic, payload) {
      console.log(" 收到 topic:" + topic + " , payload :" + payload)
      wx.showModal({
        content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
        showCancel: false,
      });
    })
    //服务器连接异常的回调
    that.data.client.on("error", function(error) {
      console.log(" 服务器 error 的回调" + error)

    })
    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function() {
      console.log(" 服务器 reconnect的回调")

    })
    //服务器连接异常的回调
    that.data.client.on("offline", function(errr) {
      console.log(" 服务器offline的回调")

		})
		if (this.data.client && this.data.client.connected) {
      //仅订阅单个主题
      this.data.client.subscribe('aed', function(err, granted) {
        if (!err) {
          wx.showToast({
            title: '订阅主题成功'
          })
        } else {
          wx.showToast({
            title: '订阅主题失败',
            icon: 'fail',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
		}
		const message='{"id":"0"}';
            this.data.client.publish("aed",message,{qos : 2})
            wx.showToast({
							title: '关锁成功'
						})
	}
});
