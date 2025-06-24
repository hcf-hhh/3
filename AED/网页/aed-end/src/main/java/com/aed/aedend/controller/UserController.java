package com.aed.aedend.controller;

import com.aed.aedend.entity.User;
import com.aed.aedend.response.Result;
import com.aed.aedend.service.UserService;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * ClassName: UserController
 * Description:
 * date: 2023/12/11 19:46
 *
 * @author Wang
 * @since JDK 1.8
 */
@RestController
@RequestMapping(value = "/user")
@Api(tags = "用户登录注册接口")
public class UserController {
    @Resource
    private UserService userService;

    /**
     * 注册
     * @param user
     * @return
     */
    @PostMapping("/register")
    public Result register(@RequestBody User user){
        return userService.register(user);
    }

    /**
     * 登录
     * @param user
     * @return
     */
    @PostMapping("/login")
    public Result login(@RequestBody User user){
        return userService.login(user);
    }

    /**
     * 查找所有人员数据
     * @return
     */
    @GetMapping
    public Result findAll() {
        return userService.findAll();
    }

    @PostMapping("/findById")
    public Result findById(@RequestParam("id") String id) {
        return userService.findById(id);
    }

    @PostMapping("/findByName")
    public Result findByName(@RequestParam("name") String name) {
        return userService.findByName(name);
    }

    @PostMapping("/save")
    public Result save(@RequestBody User user) {
        userService.saveOrUpdate(user);
        return Result.success();
    }

    @PostMapping(value = "/remove")
    public Result remove(@RequestParam(name = "ids") String ids) {
        return userService.updateDeleteByPrimaryKey(ids);
    }

}
