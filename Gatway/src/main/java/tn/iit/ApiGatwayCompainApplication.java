package tn.iit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
@EnableDiscoveryClient
@SpringBootApplication
public class ApiGatwayCompainApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatwayCompainApplication.class, args);
	}

}
