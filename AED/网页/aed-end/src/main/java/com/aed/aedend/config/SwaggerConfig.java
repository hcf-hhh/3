package com.aed.aedend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.ArrayList;

/**
 * ClassName: SwaggerConfig
 * Description:
 * date: 2023/12/1 20:10
 *
 * @author Wang
 * @since JDK 1.8
 */
@Configuration
@EnableSwagger2
@ComponentScan(basePackages = "com.aed.aedend.controller")
public class SwaggerConfig{

    public static final Contact DEFAULT_CONTACT = new Contact("anoxia", "http://localhost:10000", "2930589344@qq.com");

    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfo(
                //API 文档的名称
                "测试API文档",
                //API 文档的描述内容
                "该文档用于测试API接口的显示与解释",
                //API 文档的版本号
                "V1.0",
                //API的service URL
                "urn:tos",
                //Contact
                DEFAULT_CONTACT,
                //API License
                "Apache 2.0",
                //API License的连接
                "https://www.apache.org/Licenses/LICENSE-2.0",
                //API vendorExtensions
                new ArrayList<>()
        );
    }

}

