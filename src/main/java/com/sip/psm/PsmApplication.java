package com.sip.psm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // permet d'envoyer l'email en arrière-plan (sans bloquer l'inscription)
public class PsmApplication {

	public static void main(String[] args) {
		SpringApplication.run(PsmApplication.class, args);
	}
}
