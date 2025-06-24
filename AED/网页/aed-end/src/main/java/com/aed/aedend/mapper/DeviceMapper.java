package com.aed.aedend.mapper;

import com.aed.aedend.entity.Device;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * ClassName: DeviceMapper
 * Description:
 * date: 2023/11/30 20:31
 * @author Wang
 * @since JDK 1.8
 */
@Mapper
public interface DeviceMapper extends BaseMapper<Device> {

    List<Device> searchAllPowerTest();

    int delete(@Param("ids") List<String> ids);

    List<Device> findAll();

    List<Device> findByDeviceId(@Param("id") String id);

    List<Device> findByPowerTest(@Param("powerTest") String powerTest);

    int insertOrUpdate(@Param("item") Device device);

}
