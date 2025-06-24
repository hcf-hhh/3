package com.aed.aedend.mapper;


import com.aed.aedend.entity.Device;
import com.aed.aedend.entity.User;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * ClassName: UserMapper
 * Description:
 * date: 2023/12/11 19:43
 *
 * @author Wang
 * @since JDK 1.8
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    User queryByName(@Param("name") String name);

    User findById (@Param("id") String id);

    int delete(@Param("ids") List<String> ids);

    List<User> findAll();

    List<User> findByName(@Param("name") String name);

}
