package com.vascosmos.scm;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Takes the place of the traditional web.xml configuration file.
 * 
 * APIs will be accessible at http://localhost:8080/api/
 * 
 * UI Is accessible at http://localhost:8080/login
 * 
 * NOTE: All APIs must be within a sub-package or the same package as this class.
 * 
 * @author dhingey
 *
 */
@Configuration
@EnableAutoConfiguration(exclude={SolrAutoConfiguration.class})
@ComponentScan
public class Init extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(Init.class);
	}

}
