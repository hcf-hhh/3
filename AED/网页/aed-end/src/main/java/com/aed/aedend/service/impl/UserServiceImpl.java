package com.aed.aedend.service.impl;


import com.aed.aedend.entity.User;
import com.aed.aedend.mapper.UserMapper;
import com.aed.aedend.response.Result;
import com.aed.aedend.service.UserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * ClassName: UserServiceImpl
 * Description:
 * date: 2023/12/11 19:45
 *
 * @author Wang
 * @since JDK 1.8
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    @Resource
    private UserMapper userMapper;

    @Override
    public Result register(User user) {
        if(ObjectUtils.isEmpty(userMapper.queryByName(user.getName()))) {
            save(user);
            return Result.success("注册成功");
        }else {
            return Result.error("注册失败");
        }
    }

    @Override
    public Result login(User user) {
        User user1 = userMapper.queryByName(user.getName());
        if (!ObjectUtils.isEmpty(user1)) {
            if(user1.getPwd().equals(user.getPwd())) {
                return Result.success("登录成功");
            }else {
                return Result.error("登录失败");
            }
        } else {
            return Result.error("登录失败");
        }
    }

    @Override
    public Result findById(String id) {
        return Result.success("操作成功").data(userMapper.findById(id));
    }

    @Override
    public Result findAll() {
        return Result.success("操作成功").data(userMapper.findAll());
    }

    @Override
    public Result updateDeleteByPrimaryKey(String ids) {
        String[] idSplit = ids.split(",");
        List<String> idsList = new ArrayList<>(Arrays.asList(idSplit));
        if (CollectionUtils.isNotEmpty(idsList)) {
            userMapper.delete(idsList);
            userMapper.delete(idsList);
            return Result.success("操作成功");
        }
        return Result.error("操作失败");
    }

    @Override
    public Result findByName(String name) {
        return Result.success("查询成功").data(userMapper.findByName(name));
    }
}
