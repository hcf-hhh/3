import axios from 'axios'
import { Message } from 'element-ui'
import NProgress from 'nprogress'//进度条
import 'nprogress/nprogress.css'
NProgress.configure({
    easing: 'ease',
    speed: 500,
    showSpinner: false
})
// const baseURL = 'http://122.51.67.189:10000'
const baseURL = 'http://localhost:10000'
// const baseURL = 'http://43.137.10.141:10000'
// const baseURL = 'https://www.yuetongroad.com/aed'
// 创建axios实列
const request = axios.create({
    // [配置]VUE中通过process.env判断开发，测试和生产环境，并分环境配置不同的URL HOST，在.env.production中配置同域名下的相对前缀路径，一旦配置了 baseURL，之后请求传入的 url 都会和我们的 baseURL 拼接成完整的绝对地址，除非请求传入的 url 已经是绝对地址。
    baseURL: baseURL,
    // 配置请求超时时间
    timeout: 100000,
    responseType: 'json',
    // 定义统一的请求头
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        isToken:false
    }
})
// 请求拦截器
request.interceptors.request.use(
    (config) => {
        NProgress.start() // 开始
        if (config.method === 'post') {
            config.data = config.data || {}
        }
        // let userInfo = localStorage.getItem('satoken')
        // let satoken = userInfo ? userInfo : ''
        // if (satoken) {
        //     config.headers.satoken = satoken
        //     config.headers.Authorization = satoken
        // }
        // 文件上传的请求超时时间设置为两分钟
        if (config.type && config.type === 'file') {
            config.timeout = 120000
        }
        return config
    },
    (error) => {
        Message.error('网络错误！')
        // 触发promise的reject事件
        return Promise.reject(error)
    },
)
// 响应拦截器
request.interceptors.response.use(
    (response) => {
        NProgress.done()
        const res = response.data
        if (res) {
            if (res.state === false) {
                return Promise.reject(res)
            } else {
                return res
            }
        } else {
            return Promise.reject(res)
        }
    },
    (error) => {
        if (error.message !== '取消上传') {
            Message.error(error.message || '网络错误！')
            if (window.location.hash !== '#/login') {
                window.location.href = '/#/login'
            }
        }
        return Promise.reject(error)
    },
)

export default request
