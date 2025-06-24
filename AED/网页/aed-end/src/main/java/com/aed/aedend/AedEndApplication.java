package com.aed.aedend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import springfox.documentation.oas.annotations.EnableOpenApi;

@MapperScan(basePackages = "com.aed.aedend.mapper")
@SpringBootApplication(scanBasePackages = "com.aed")
@EnableOpenApi
public class AedEndApplication {

	public static void main(String[] args) {
		SpringApplication.run(AedEndApplication.class, args);
	}

}
