package com.aed.aedend.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * ClassName: IdDto
 * Description:
 * date: 2023/11/30 20:49
 *
 * @author Wang
 * @since JDK 1.8
 */
@Data
@ApiModel("共用的idDto")
public class IdDto {
    @ApiModelProperty("id")
    private String id;
}