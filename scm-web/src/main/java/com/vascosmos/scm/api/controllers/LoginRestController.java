package com.vascosmos.scm.api.controllers;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.vascosmos.scm.api.LoginController;
import com.vascosmos.scm.api.dao.LeadDao;
import com.vascosmos.scm.api.models.Lead;

@RestController
public class LoginRestController {
	private static final Logger LOG = Logger.getLogger(LoginController.class);
	
	private static final String EMAIL = "email";
	private static final String PASSWORD = "password";
	private static final String STATUS = "status";
	private static final String FAILED = "failed";
	private static final String SUCCESS = "success";
	private static final String USER_ID = "userId";
	private static final String ERR_0 = "err_0";
	private static final String ERR_1 = "err_1";
	private static final String ERR_2 = "err_2";
	private static final String ERROR = "error";
	private static final String MESSAGE = "message";

	@Autowired
	LeadDao leadDao;
	
	@RequestMapping( 
			method={RequestMethod.POST}, 
			produces = { "application/json", "application/xml" }, 
			value={"/rest/login"})
	public Map<String, Object> login(@RequestBody Map<String, Object> requsetJoson, HttpServletResponse response) { 
		Map<String, Object> result = new HashMap<>();
		String email = (String) requsetJoson.get(EMAIL);
		String password = (String) requsetJoson.get(PASSWORD);
		
		if(!StringUtils.hasLength(email) || !StringUtils.hasLength(password) ) {
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED);
			result.put(ERROR, ERR_1);
			result.put(MESSAGE, "Email and/or Password can't be null");
			return result;
		}

		try{
			Lead lead = leadDao.getLeadByEmail(email);
			if(lead.getPassword().equals(password)){
				result.put(STATUS, SUCCESS);
				result.put(USER_ID, lead.getId());
				//result.put(ERROR, ERR_0);
				result.put(MESSAGE, "User logged in successful.");
			}
		}catch(Exception e){
			//email doesn't exist
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED);
			result.put(ERROR, ERR_2);
			result.put(MESSAGE, "Oops..something went worng.");
		}
		return result;
	}

}
