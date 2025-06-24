import mqtt from '../../utils/mqtt';

Page({
  data: {
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
  onClick_connect: function() {
    var that = this;
    //开始连接
    this.data.client = mqtt.connect(`wx://yuetongroad.com:8083/mqtt`, this.data.mqttOptions)
    this.data.client.on('connect', function(connack) {
      wx.showToast({
        title: '连接成功'
      })
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


  },
  onClick_SubOne: function() {
    if (this.data.client && this.data.client.connected) {
      //仅订阅单个主题
      this.data.client.subscribe('aed_test', function(err, granted) {
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
  },
  onClick_SubMany: function() {

    if (this.data.client && this.data.client.connected) {
      //仅订阅多个主题
      this.data.client.subscribe({
        'Topic1': {
          qos: 0
        },
        'Topic2': {
          qos: 1
        }
      }, function(err, granted) {
        if (!err) {
          wx.showToast({
            title: '订阅多主题成功'
          })
        } else {
          wx.showToast({
            title: '订阅多主题失败',
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
	},
// 	onClick_PubMsg: function() {
// 			const publishFunc = () => {
// 				this.data.client.publish("id", "abcd", { qos: 1 }, function(err) {
// 					this.data.count--;
// 					if (!err) {
// 						console.log('发布成功');
// 					}
// 			})
// 			this.data.count++;
// 			setTimeout(async () => {
// 				if (this.data.count) {
// 					this.data.waitToInvoke.push(publishFunc)
// 					this.connnectMqtt();
// 					this.mqttOnConnect();
// 					this.mqttOnReconnect()
// 					this.mqttSubscribe()
// 					this.mqttOnMessage()
// 				}
// 			}, 2000)
// 			publishFunc();
// 	}
// },
// 	mqttOnConnect() {
// 		this.data.client.on('connect', () => {
// 			while(this.data.waitToInvoke.length) {
// 				const func = this.data.waitToInvoke.shift()
// 				func()
// 			}
// 		});
// 	},
//mqtt发送数据，只支持string，不支持16进制buffer
// onClick_PubMsg: function() {
// 	this.data.client.publish('msg', "121", { qos: 2 }, function (err) {
// 		console.log('send', "无法发送")
// 	})
// },
onClick_PubMsg:function(){
            const message='abcd';
            this.data.client.publish("aed_test",message,{qos : 2})
            console.log("发布消息成功....."+message)
				},
  // onClick_PubMsg: function() {
  //   if (this.data.client && this.data.client.connected) {
  //     this.data.client.publish("id", "hello");
  //     wx.showToast({
  //       title: '发布成功'
  //     })
  //   } else {
  //     wx.showToast({
  //       title: '请先连接服务器',
  //       icon: 'none',
  //       duration: 2000
  //     })
  //   }
	// },

  onClick_unSubOne: function() {
    if (this.data.client && this.data.client.connected) {
      this.data.client.unsubscribe('aed');
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onClick_unSubMany: function() {
    if (this.data.client && this.data.client.connected) {
      this.data.client.unsubscribe(['Topic1', 'Topic2']);
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  }


})