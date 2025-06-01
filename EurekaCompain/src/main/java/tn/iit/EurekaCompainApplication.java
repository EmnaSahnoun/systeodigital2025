package tn.iit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class EurekaCompainApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaCompainApplication.class, args);
	}

}
