import request from '@/utils/request.js';

export default {
    findById(id) {
        return request({
            url: `/user/findById?id=${id}`,
            method: "post"
        })
    },
    findByName(name) {
        return request({
            url: `/user/findByName?name=${name}`,
            method: "post"
        })
    },
    save(data) {
        return request({
            url: "/user/save",
            method: "post",
            data
        })
    },
    delete(ids) {
        return request({
            url:`/user/remove?ids=${ids}`,
            method:"post"
        })
    },
}