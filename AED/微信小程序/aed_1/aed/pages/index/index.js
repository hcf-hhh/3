
// Page({
// 	data: {
// 		device:{},
// 	},
//   map: function(){
// 	this.queryAdress()
//   let key ='OXPBZ-PLU6N-3L4F6-SQIFC-F4W2H-IDB34'; //使用在腾讯位置服务申请的key
//   let referer ='智能AED导航系统';  //调用插件的小程序的名称
//   let endPoint = JSON.stringify({ //终点
//     'name':this.device.deviceId,
//     'latitude': this.device.lat,
//     'longitude': this.device.lon
//   });
//   wx.navigateTo({
//     url:'plugin://routePlan/route-plan?key=' + key +'&referer=' + referer +'&endPoint=' + endPoint
//   });
// },
// queryAdress: function() {
// 	wx.request({
// 		url: 'http://localhost:10000/device',
// 		method: 'GET',
// 		header: {
// 			'content-type': 'aplication/json'
// 		},
// 		success: res => {
// 			console.log(res)
// 			this.device = res.data.slice(0,1);
// 		}
// 	})
// }

// })
Page({
	data: {
		device: {},
	},
	map: function () {
		this.queryAddress();
		let key = 'OXPBZ-PLU6N-3L4F6-SQIFC-F4W2H-IDB34'; //使用在腾讯位置服务申请的key
		let referer = '智能AED导航系统'; //调用插件的小程序的名称
		let endPoint = JSON.stringify({ //终点
			'name': this.device.deviceId,
			'latitude': this.device.lat,
			'longitude': this.device.lon
		});
		wx.navigateTo({
			url: 'plugin://routePlan/route-plan?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
		});
	},
	queryAddress: function () {
		wx.request({
			url: 'http://localhost:10000/device',
			method: 'GET',
			header: {
				'content-type': 'application/json'
			},
			success: res => {
				console.log(res);
				this.setData({
					device: res.data.slice(0, 1)
				});
			}
		});
	}
});