package com.aed.aedend.response;

import lombok.Data;
import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;

/**
 * ClassName: Result
 * Description:
 * date: 2023/11/30 20:47
 *
 * @author Wang
 * @since JDK 1.8
 */
@Data
public class Result implements Serializable {

    private int code;

    private String msg;

    private Object data;

    private Result() {
    }

    public static Result success() {
        return success(StringUtils.EMPTY);
    }

    public static Result success(String msg) {
        return new Result().code(ResultConst.SUCCESS_CODE).msg(msg);
    }

    public static Result error() {
        return error("系统错误");
    }

    public static Result error(String msg) {
        return new Result().code(ResultConst.ERROR_CODE_500).msg(msg);
    }

    public Result code(int code) {
        this.code = code;
        return this;
    }

    public Result msg(String msg) {
        this.msg = msg;
        return this;
    }

    public Result data(Object data) {
        this.data = data;
        return this;
    }
}
