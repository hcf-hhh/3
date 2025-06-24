package com.aed.aedend.response;

/**
 * ClassName: ResultConst
 * Description:
 * date: 2023/11/30 20:48
 *
 * @author Wang
 * @since JDK 1.8
 */
public interface ResultConst {

    /**
     * 200:成功
     */
    int SUCCESS_CODE = 200;

    /**
     * 500:服务器错误
     */
    int ERROR_CODE_500 = 500;

    /**
     * 400:错误请求
     */
    int ERROR_CODE_400 = 400;

    /**
     * 600:无法解析的响应标头
     */
    int ERROR_CODE_600 = 600;

    /**
     * 401:未经授权
     */
    int ERROR_CODE_401 = 401;
}

