package com.cisco.scm.view;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.jknack.handlebars.Jackson2Helper;
import com.github.jknack.handlebars.springmvc.HandlebarsViewResolver;

/**
 * @author dhingey
 *
 */
@Configuration
public class ViewModule {

	@Bean
	public HandlebarsViewResolver viewResolver() {
		final HandlebarsViewResolver viewResolver = new HandlebarsViewResolver();

		viewResolver.setCache(false);
		viewResolver.setPrefix("/templates");
		viewResolver.setSuffix(".html");
		// Allows for JSON to be rendered into Handlebars templates
		// See https://jknack.github.io/handlebars.java/jackson.html
		viewResolver.registerHelper("json", Jackson2Helper.INSTANCE);
		return viewResolver;
	}

}
