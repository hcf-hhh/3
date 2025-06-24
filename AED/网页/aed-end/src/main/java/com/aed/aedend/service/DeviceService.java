package com.aed.aedend.service;


import com.aed.aedend.entity.Device;
import com.aed.aedend.response.Result;
import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.ibatis.annotations.Param;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * ClassName: DeviceService
 * Description:
 * date: 2023/11/30 20:31
 *
 * @author Wang
 * @since JDK 1.8
 */
public interface DeviceService extends IService<Device> {

    List<Device> searchAllPowerTest();

    Result updateDeleteByPrimaryKey(String ids);

    Result findAll();

    Result findByDeviceId(String id);

    Result findByPowerTest(String powerTest);

    Result insertOrUpdate(Device device);

    /**
     * 查看图片
     * @param filePath
     * @return
     */
    ResponseEntity<InputStreamResource> viewPicture(String filePath) throws Exception;
}
