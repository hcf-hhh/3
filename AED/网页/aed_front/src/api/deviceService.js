import request from '@/utils/request.js';

export default {
    searchList(data) {
        return request({
            url: "/device",
            method: "get",
            data
        })
    },
    save(data) {
        return request({
            url: "/device/save",
            method: "post",
            data
        })
    },
    // 批量删除
    delete(ids) {
        return request({
            url:`/device/remove?ids=${ids}`,
            method:"post"
        })
    },
    findById(id) {
        return request({
            url: `/device/find/${id}`,
            method: "get",
        })
    },
    findByDeviceId(id) {
        return request({
            url: `/device/findByDeviceId?id=${id}`,
            method: "post",
        })
    },
    findByPowerTest(powerTest) {
        return request({
            url: `/device/findByPowerTest?powerTest=${powerTest}`,
            method: "post",
        })
    },
    viewPicture(filePath){
        return request({
            url:`/device/viewPicture?filePath=${filePath}`,
            method:"get",
            responseType:'blob'
        })
    },

}