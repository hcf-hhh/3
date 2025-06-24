package com.aed.aedend.utils;

import org.apache.commons.lang3.StringUtils;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

/**
 * ClassName: FileUtil
 * Description:
 * date: 2024/3/24 12:18
 *
 * @author Wang
 * @since JDK 1.8
 */

public class FileUtil {

    /**
     *
     * @param uploadFile
     * @param uploadFilePath 文件上传路径
     * @param uploadFileMapping，文件映射路径
     * @return
     */

    public static String uploadFile(MultipartFile uploadFile, String uploadFilePath, String uploadFileMapping) {
        // 1、基本校验
        if (null == uploadFile || StringUtils.isEmpty(uploadFile.getOriginalFilename())) {
            return null;
        }
        // 2、配置文件路径+文件模块名称+UUID文件名
        StringBuilder uploadPath = new StringBuilder(uploadFilePath);
        uploadPath.append(File.separator);
        String originalFilename = uploadFile.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
//        uploadPath.append(UniqueIdUtil.generateRandomId()).append(suffix);
        // 3、文件上传
        File file = upload(uploadFile, uploadPath.toString());
        // 4、返回映射路径
        String httpPath = null == file ? null : uploadPath.replace(0, uploadFilePath.length(), uploadFileMapping).toString();
        return httpPath.replace("\\", "/");
    }

    /**
     * 将文件名解析成文件的上传路径
     *
     * @param file  上传文件
     * @param filePath 上传文件目录名称
     * @return 执行结果

     */
    public static File upload(MultipartFile file, String filePath) {
        try {
            // getCanonicalFile 可解析正确各种路径
            File dest = new File(filePath).getCanonicalFile();
            // 检测是否存在目录
            if (!dest.getParentFile().exists()) {
                dest.getParentFile().mkdirs();
            }
            // 文件写入
            file.transferTo(dest);
            return dest;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 下载文件
     * @param filePath
     * @return
     * @throws IOException
     */
    public static ResponseEntity<InputStreamResource> downloadFile(String filePath) throws IOException {

        File file = new File(filePath);
        InputStreamResource resource = new InputStreamResource(Files.newInputStream(file.toPath()));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName());

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);

    }
}


