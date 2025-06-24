package com.aed.aedend.utils;

import java.io.FileReader;
import java.io.IOException;
import com.google.gson.Gson;

/**
 * ClassName: SubscribeSample
 * Description:
 * date: 2024/3/18 15:59
 *
 * @author Wang
 * @since JDK 1.8
 */
public class Area {
    public static void main(String[] args) {
        try {
            // 读取JSON文件内容
            FileReader reader = new FileReader("D:\\JavaLearn\\简历\\笔试\\上机题-判断点是否在多边形内\\latlon.json");

            // 使用Gson库将JSON内容解析成数组
            Gson gson = new Gson();
            Object[] jsonArray = gson.fromJson(reader, Object[].class);

            // 输出数组内容
            for (Object obj : jsonArray) {
                System.out.println(obj);
            }

            // 关闭文件流
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
