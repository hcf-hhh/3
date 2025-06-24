package com.aed.aedend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.MapSessionRepository;
import org.springframework.session.config.annotation.web.http.EnableSpringHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

import java.util.concurrent.ConcurrentHashMap;

/**
 * ClassName: SpringHttpSessionConfig
 * Description:
 * date: 2024/3/24 19:13
 *
 * @author Wang
 * @since JDK 1.8
 */
@Configuration
@EnableSpringHttpSession
public class SpringHttpSessionConfig {

    // 读写Cookies中的SessionId信息
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("JSESSIONID");
        // 用正则表达式配置匹配的域名，可以兼容 localhost、127.0.0.1 等各种场景
        serializer.setDomainNamePattern("^.+?\\.(\\w+\\.[a-z]+)$");
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(false);
        // 最大生命周期的单位是秒
        serializer.setCookieMaxAge(24 * 60 * 60);
        return serializer;
    }

    // Session信息在服务器上的存储仓库
    // 当前存在内存中
    @Bean
    public MapSessionRepository sessionRepository(){
        return new MapSessionRepository(new ConcurrentHashMap<>());
    }

}