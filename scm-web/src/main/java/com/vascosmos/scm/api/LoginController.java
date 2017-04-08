package com.vascosmos.scm.api;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.vascosmos.scm.api.dao.LeadDao;
import com.vascosmos.scm.api.models.Lead;
import com.vascosmos.scm.util.ApplicationConstants;
import com.vascosmos.scm.util.SessionConstants;

/**
 * 
 * Login API. Currently does not validate the provided password using LDAP.
 * 
 * TODO Implement LDAP credential validation when desired.
 * 
 * @author dhingey
 *
 */
@Controller
public class LoginController {

	private static final Logger LOG = Logger.getLogger(LoginController.class);

	@Autowired
	LeadDao leadDao;
	
	@RequestMapping("/api/login")
	public @ResponseBody BasicResponse login(@RequestParam(value = "login-username", required = true) String userName,
			@RequestParam(value = "login-password", required = true) String password, HttpSession session) {

		LOG.info("Current session's user is:  " + session.getAttribute("username"));

		LOG.info("Logging in as " + userName);

		BasicResponse response;
		if (userName == null || password == null || userName.trim().equals("") || password.trim().equals("")) {
			response = new BasicResponse(false, "Please provide valid credentials.");
		} else {
			boolean success = validateCECUser(userName, password, session);
			//boolean success = true;
			if (success) {
				response = new BasicResponse(true);
				response.setRedirect(ApplicationConstants.DEVICE_DASHBOARD);
				
			} else {
				response = new BasicResponse(false, "Failed to authenticate. Please check your credentials.");
			}
		}

		return response;
	}

	private boolean validateCECUser(String username, String password, HttpSession session) {
		try {
			Lead lead = leadDao.getLeadByEmail(username);
			// Save the username to the session
			session.setAttribute(SessionConstants.USERNAME, lead.getLast() + " " + lead.getFirst() );

			session.setAttribute(SessionConstants.USER, lead );

			return lead.getPassword().equals(password);
		} catch (Exception e) {
			return false;
		}
		
	}

}
