package com.aed.aedend.service;

import com.aed.aedend.entity.User;
import com.aed.aedend.response.Result;
import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * ClassName: UserService
 * Description:
 * date: 2023/12/11 19:44
 *
 * @author Wang
 * @since JDK 1.8
 */
public interface UserService extends IService<User> {

    Result register(User user);

    Result login(User user);

    Result findById (String id);

    Result findAll();

    Result updateDeleteByPrimaryKey(String ids);

    Result findByName(String name);
}
