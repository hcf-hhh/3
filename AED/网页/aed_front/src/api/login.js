import request from '@/utils/request.js';

export default {
    login(data) {
        return request({
            url: "/user/login",
            method: "post",
            data
        })
    },
    register(data) {
        return request({
            url: "/user/register",
            method: "post",
            data
        })
    }
}