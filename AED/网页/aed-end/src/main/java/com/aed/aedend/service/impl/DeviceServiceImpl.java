package com.aed.aedend.service.impl;

import com.aed.aedend.entity.Device;
import com.aed.aedend.mapper.DeviceMapper;
import com.aed.aedend.response.Result;
import com.aed.aedend.service.DeviceService;
import com.aed.aedend.utils.FileUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


/**
 * ClassName: DeviceServiceImpl
 * Description:
 * date: 2023/11/30 20:31
 * @author Wang
 * @since JDK 1.8
 */
@Service
public class DeviceServiceImpl extends ServiceImpl<DeviceMapper, Device> implements DeviceService {

    @Resource
    private DeviceMapper deviceMapper;

    @Override
    public List<Device> searchAllPowerTest() {
        return deviceMapper.searchAllPowerTest();
    }

    @Override
    public Result updateDeleteByPrimaryKey(String ids) {
        String[] idSplit = ids.split(",");
        List<String> idsList = new ArrayList<>(Arrays.asList(idSplit));
        if (CollectionUtils.isNotEmpty(idsList)) {
            deviceMapper.delete(idsList);
            deviceMapper.delete(idsList);
            return Result.success("操作成功");
        }
        return Result.error("操作失败");
    }

    @Override
    public Result findAll() {
        return Result.success("操作成功").data(deviceMapper.findAll());
    }

    @Override
    public Result findByDeviceId(String id) {
        return Result.success("操作成功").data(deviceMapper.findByDeviceId(id));
    }

    @Override
    public Result findByPowerTest(String powerTest) {
        return Result.success("查询成功").data(deviceMapper.findByPowerTest(powerTest));
    }

    @Override
    public Result insertOrUpdate(Device device) {
        return Result.success("操作成功").data(deviceMapper.insertOrUpdate(device));
    }

    @Override
    public ResponseEntity<InputStreamResource> viewPicture(String filePath) throws Exception {
        return FileUtil.downloadFile(filePath);
    }
}
