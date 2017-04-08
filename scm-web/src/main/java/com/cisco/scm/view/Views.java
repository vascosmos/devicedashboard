package com.cisco.scm.view;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.QueryParam;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.cisco.scm.api.dao.DeviceDao;
import com.cisco.scm.api.dao.LeadDao;
import com.cisco.scm.api.models.Device;
import com.cisco.scm.api.models.Lead;
import com.cisco.scm.util.ApplicationConstants;
import com.cisco.scm.util.SessionConstants;
import com.cisco.scm.util.SessionUtils;
import com.cisco.scm.util.SessionUtils.UserSessionData;

/**
 * Define routes.
 * 
 */
@Controller
public class Views {

	@Autowired
	HttpSession session;
	
	@Autowired
	LeadDao leadDao;
	
	@Autowired
	DeviceDao deviceDao;
	
	private void prepare(Model model) {
		// Add standard data to the page for rendering
		UserSessionData sessionData = SessionUtils.getSessionDataAsObject(session);
		if (sessionData.isUserLoggedIn()) {
			model.addAttribute("userName", sessionData.userName);
			model.addAttribute(SessionConstants.USER, session.getAttribute(SessionConstants.USER));
		}
	}

	@RequestMapping("/" + ApplicationConstants.LOGIN_PAGE)
	public void login(final HttpServletRequest req, final Model model) {
		prepare(model);
	}

	@RequestMapping("/" + ApplicationConstants.MODELS_PAGE)
	public void models(final HttpServletRequest req, final Model model) {
		prepare(model);
		model.addAttribute("modelsScript", true);

	}

	@RequestMapping("/")
	public ModelAndView home(final HttpServletRequest req, final Model model) {
		prepare(model);
		return new ModelAndView("redirect:/login");
	}

	@RequestMapping("/registration")
	public void registration(final HttpServletRequest req, final Model model) {
		prepare(model);
	}
	@RequestMapping("/successReg")
	public void successReg(final HttpServletRequest req, final Model model) {
		prepare(model);
	}
	
	@RequestMapping("/validateEmail")
	public void validateEmail(@QueryParam("token") String token, final HttpServletRequest req, final Model model) {
		// write a query for validate email and navigate to set password.
		Lead lead = leadDao.getLeadbyRandom(token);
		if(lead != null) {
			lead.setIsActive("Y");
		}
		
		leadDao.update(lead);
		
		session.setAttribute("lead", lead);
	}
	
	@RequestMapping("/updatePassword")
	public ModelAndView updatePassword(@RequestBody Lead lead, final HttpServletRequest req, final Model model) {
		// write a query for validate email and navigate to set password.
		//String email = lead.getEmail();
		String password = lead.getPassword();
		Lead dbLead = (Lead)session.getAttribute("lead");
		dbLead.setPassword(password);
		leadDao.update(dbLead);
		Device d = new Device();
		d.setEmail(dbLead.getEmail());
		d.setActive("Y");
		deviceDao.create(d);
		return new ModelAndView("redirect:/login");
	}
	
	@RequestMapping("/device-dashboard")
	public void deviceDashboard(final HttpServletRequest req, final Model model) {
		prepare(model);
	}
}
