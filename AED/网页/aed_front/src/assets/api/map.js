import request from '@/utils/request.js';

export default {
    map(){
        return request({
            url:"/device",
            method:"get",
            data
        })
    }
}