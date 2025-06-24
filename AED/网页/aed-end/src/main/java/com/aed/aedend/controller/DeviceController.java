package com.aed.aedend.controller;


import com.aed.aedend.entity.Device;
import com.aed.aedend.response.Result;
import com.aed.aedend.service.DeviceService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ClassName: DeviceController
 * Description:
 * date: 2023/11/30 20:30
 * @author Wang
 * @since JDK 1.8
 */
@RestController
@RequestMapping(value = "/device" , produces = {"application/json;charset=UTF-8"})
@Api(tags = "设备增删改查接口")
public class DeviceController {
    @Autowired
    private DeviceService deviceService;

    @Autowired
    private ResourceLoader resourceLoader;

    @PostMapping("/save")
    public Result save(@RequestBody Device device) {
        deviceService.insertOrUpdate(device);
        return Result.success();
    }

    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        deviceService.removeById(id);
        return Result.success();
    }

    @PostMapping("/del/batch")
    public Result deleteBatch(@RequestBody List<Integer> ids) {
        deviceService.removeByIds(ids);
        return Result.success();
    }

    @GetMapping
    public Result findAll() {
        return deviceService.findAll();
    }

    @GetMapping("/find/{id}")
    public Result findOne(@PathVariable(name = "id") String id) {
        return Result.success().data(deviceService.getById(id));
    }

    @GetMapping("/searchAllPowerTest")
    public Result searchAllPowerTest() {
        return Result.success().data(deviceService.searchAllPowerTest());
    }

    @GetMapping("/page")
    public Result findPage(@RequestParam Integer pageNum,
                           @RequestParam Integer pageSize) {
        QueryWrapper<Device> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("id");
        return Result.success().data(deviceService.page(new Page<>(pageNum, pageSize), queryWrapper));
    }

    @PostMapping(value = "/remove")
    public Result remove(@RequestParam(name = "ids") String ids) {
        return deviceService.updateDeleteByPrimaryKey(ids);
    }

    @PostMapping(value = "findByDeviceId")
    public Result findByDeviceId(@RequestParam(name = "id") String id) {
        return deviceService.findByDeviceId(id);
    }

    @PostMapping(value = "findByPowerTest")
    public Result findByPowerTest(@RequestParam(name = "powerTest") String powerTest) {
        return deviceService.findByPowerTest(powerTest);
    }

    /**
     * 下载图片
     * @param filePath
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/viewPicture", method = RequestMethod.GET)
    public ResponseEntity<InputStreamResource> downloadFile(@RequestParam("filePath") String filePath) throws Exception {
        if (StringUtils.isEmpty(filePath)){
            throw new Exception("参数不合法");
        }
        return deviceService.viewPicture(filePath);
    }

//    /**
//     * 获取图片
//     * @return
//     */
//    @GetMapping("/getImage")
//    public ResponseEntity<Resource> getImage(@RequestParam("filePath") String filePath) {
//        Resource imageFile = resourceLoader.getResource("file:" + filePath); // 实际加载资源
//        String contentType = determineContentType(filePath); // 根据文件路径动态确定类型
//        return ResponseEntity.ok()
//                .contentType(MediaType.parseMediaType(contentType))
//                .body(imageFile);
//    }

    private String determineContentType(String filePath) {
        // 根据文件路径动态确定文件类型，这里仅为示例
        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filePath.endsWith(".png")) {
            return "image/png";
        } else if (filePath.endsWith(".gif")) {
            return "image/gif";
        } else {
            return "application/octet-stream";
        }
    }

}
