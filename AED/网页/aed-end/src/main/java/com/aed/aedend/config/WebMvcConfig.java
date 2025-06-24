package com.aed.aedend.config;

import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.support.config.FastJsonConfig;
import com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ClassName: WebMvcConfig
 * Description:
 * date: 2023/12/1 20:09
 *
 * @author Wang
 * @since JDK 1.8
 */
//@EnableWebMvc
//@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

//    /**
//     * configureMessageConverters：信息转换器
//     * 消息内容转换配置
//     * 配置fastJson返回json转换
//     * @param converters
//     */
//    @Override
//    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
//        //添加fastjson的配置信息，比如：是否要格式化返回的json数据
//        FastJsonConfig fastJsonConfig = new FastJsonConfig();
//        //设置序列化特性
//        fastJsonConfig.setSerializerFeatures(
//                SerializerFeature.PrettyFormat,
//                SerializerFeature.WriteMapNullValue,
//                SerializerFeature.WriteEnumUsingToString,
//                SerializerFeature.WriteNullStringAsEmpty
//        );
//        //处理中文乱码问题
//        List<MediaType> fastMediaTypes = new ArrayList<>();
//        fastMediaTypes.add(MediaType.APPLICATION_JSON);
//        FastJsonHttpMessageConverter fastJsonHttpMessageConverter = new FastJsonHttpMessageConverter();
//        fastJsonHttpMessageConverter.setSupportedMediaTypes(fastMediaTypes);
//        fastJsonHttpMessageConverter.setFastJsonConfig(fastJsonConfig);
//        //在convert中添加配置信息
//        fastJsonHttpMessageConverter.setFastJsonConfig(fastJsonConfig);
//        converters.add(fastJsonHttpMessageConverter);
//    }
//
////    @Override
////    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
////        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
////        converter.setSupportedMediaTypes(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));
////        converters.add(converter);
////    }
////    @Override
////    public void addResourceHandlers(ResourceHandlerRegistry registry) {
////        // /images/**是静态映射， file:/root/images/是文件在服务器的路径
////        registry.addResourceHandler("/image/**")
////                .addResourceLocations("file:/home/aed/pic");
////    }
}
