package com.aed.aedend.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * ClassName: User
 * Description:
 * date: 2023/12/11 19:41
 *
 * @author Wang
 * @since JDK 1.8
 */
@Data
@TableName("user")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;

    private String name;

    private String pwd;

    private String phone;

    @TableField("is_deleted")
    private int isDeleted;

}
