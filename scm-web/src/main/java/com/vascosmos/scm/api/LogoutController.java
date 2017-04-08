package com.vascosmos.scm.api;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Invalidates the caller's session, effectively logging out from the application.
 * 
 * @author dhingey
 *
 */
@Controller
public class LogoutController {

	@RequestMapping("api/logout")
	public @ResponseBody BasicResponse logout(HttpSession session) {
		session.invalidate();
		BasicResponse response = new BasicResponse(true);
		response.setRedirect("login");
		return response;
	}

}
