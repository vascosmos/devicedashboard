package com.vascosmos.scm.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.vascosmos.scm.Application;
import com.vascosmos.scm.util.ApplicationConstants;
import com.vascosmos.scm.util.SessionConstants;

/**
 * Check to make sure that the user has a valid logged in session. If not, force-redirect the user to the login page.
 * 
 * @author dhingey
 *
 */
@Component
public class AuthFilter extends OncePerRequestFilter implements Filter {

	private static final String[] RESTRICTED_PAGES = { ApplicationConstants.SEARCH_PAGE, ApplicationConstants.MODELS_PAGE,
			ApplicationConstants.BU_DASHBOARD_PAGE, ApplicationConstants.GSM_DASHBOARD_PAGE,  ApplicationConstants.MODELING_PAGE,
			ApplicationConstants.DEVICE_DASHBOARD };

	@Autowired
	HttpSession session;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
		String page = request.getServletPath().substring(1);
		if (isPageRestricted(page)) {
			if (session == null || session.getAttribute(SessionConstants.USERNAME) == null) {
				try {
					response.sendRedirect(ApplicationConstants.LOGIN_PAGE);
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		// If the user is logged in and is trying to access the login page, redirect to the search page
		if (session != null && session.getAttribute(SessionConstants.USERNAME) != null && page.equalsIgnoreCase(ApplicationConstants.LOGIN_PAGE)) {
			try {
				response.sendRedirect(ApplicationConstants.DEVICE_DASHBOARD);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		chain.doFilter(request, response);
	}

	private static boolean isPageRestricted(String page) {
		// Loop through each restricted page to apply equalsIgnoreCase
		for (String restrictedPage : RESTRICTED_PAGES) {
			if (page.equalsIgnoreCase(restrictedPage)) {
				return true;
			}
		}
		return false;
	}

}