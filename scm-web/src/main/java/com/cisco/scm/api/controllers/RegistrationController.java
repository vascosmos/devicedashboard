package com.cisco.scm.api.controllers;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.cisco.scm.api.dao.LeadDao;
import com.cisco.scm.api.models.Lead;

@Controller
public class RegistrationController {
	
	/*@Autowired
	LeadDao leadDao;
	@RequestMapping("/validateEmail/*")
	public void successReg(final HttpServletRequest req, final Model model) {
		String url = req.getRequestURL().toString();
		
		String token = url.substring(url.lastIndexOf("/"), url.length());
		
		// write a query for validate email and navigate to set password.
		Lead lead = leadDao.getLeadbyRandom(token);
		if(lead != null) {
			lead.setEmailVerified("Y");
		}
		
		leadDao.update(lead);
		
		
		
	}*/
	


}
