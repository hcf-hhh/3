package com.aed.aedend.dto;

import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.sql.Blob;
import java.sql.Timestamp;

/**
 * ClassName: DeviceDto
 * Description:
 * date: 2023/11/30 20:30
 * @author Wang
 * @since JDK 1.8
 */
@Data
@ApiModel("设备dto")
public class DeviceDto {

    private String id;

    private String deviceId;

    private Double longitude;

    private Double latitude;

    private String powerTest;

    private String countTest;

    private String warning;

    private Blob picture;

    private String managerId;

    private Timestamp usetime;

    private Timestamp downtime;

    private int isDeleted;

}
