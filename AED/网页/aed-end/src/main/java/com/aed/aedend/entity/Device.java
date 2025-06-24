package com.aed.aedend.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * ClassName: Device
 * Description:
 * date: 2023/11/28 20:55
 *
 * @author Wang
 * @since JDK 1.8
 */
@Data
@TableName("project")
public class Device implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    @TableField("device_id")
    private String deviceId;

    @TableField("identity_get")
    private String identityGet;

    private String lon;

    private String lat;

    private Float pitch;

    private Float roll;

    private Float yaw;

    @TableField("power_test")
    private float powerTest;

    @TableField("count_test")
    private int countTest;

    @TableField("open_test")
    private int openTest;

    private int warning;

    private int lux;

    private String picture;

    @TableField("manager_name")
    private String managerName;

    private Timestamp usetime;


}
