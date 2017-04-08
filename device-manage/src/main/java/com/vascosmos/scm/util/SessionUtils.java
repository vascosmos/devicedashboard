package com.vascosmos.scm.util;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;

public class SessionUtils {

	private static final Logger LOG = Logger.getLogger(SessionUtils.class);

	public static UserSessionData getSessionDataAsObject(HttpSession session) {
		return new UserSessionData(session);
	}

	/**
	 * TODO Construct this object at login time and save it to the session. This will allow casting to be avoided and reduces the number of session vars.
	 * 
	 * @author dhingey
	 *
	 */
	public static class UserSessionData {

		private static final String NOT_LOGGED_IN_USER_NAME = "unknown_user"; // If the user session does not exist, set some value for null safety

		public final String userName;

		@SuppressWarnings("unchecked")
		public UserSessionData(HttpSession session) {
			userName = session.getAttribute(SessionConstants.USERNAME) == null ? NOT_LOGGED_IN_USER_NAME : session.getAttribute(SessionConstants.USERNAME).toString();
		}

		public boolean isUserLoggedIn() {
			return !userName.equals(NOT_LOGGED_IN_USER_NAME);
		}

	}
}
