package com.vascosmos.scm.api.controllers;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.ConstraintViolationException;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.vascosmos.scm.api.dao.LeadDao;
import com.vascosmos.scm.api.models.Lead;
import com.vascosmos.scm.util.NumberUtils;
import com.vascosmos.scm.util.ResponseProcessUtil;


import static com.vascosmos.scm.util.ApplicationConstants.*;

import s.util.mail.client.MailApi;
import s.util.mail.dto.MailDto;


@RestController
public class LeadController {
	
	private static final String USER_ID = "userid";
	private static final String PINCODE = "pincode";
	private static final String APP_URL = "app.url";
	
	@Autowired
	private Environment env;
	
	@Autowired
	LeadDao leadDao;
	
	@RequestMapping( 
			method={RequestMethod.PUT}, 
			produces = { "application/json", "application/xml" }, 
			value={"/api/createLead"})
	
	public Map<String, Object> createLead(@RequestBody Lead lead,HttpServletRequest request, HttpServletResponse response){
		
		Map<String, Object> result = new HashMap<>();
		
		try{

			//1. create lead.
			String randomString = randomAlphaNumeric(40);
			lead.setRandomString(randomString);
			lead.setIsActive("N");
			Integer randomInt = NumberUtils.randomInt(100000, 999999);
			lead.setPincode(randomInt);
			leadDao.create(lead);
			
			
			//2. Notify user for email validation.
			String url = formValidateURL(request, "validateEmail")+"?token="+randomString;
			String mailBody = "Please click on the following to verify your email<b><br/><a href='"+ url +"' target='_blank' >" + url+ 
					"</a></b><br/><br/>"
					+ "If you have used smart phone app, you can use pincode <strong>" + randomInt  +"</strong> for validation";
			sendEmail(Arrays.asList(lead.getEmail()), "Email verification", mailBody);
			
			result.put(STATUS,SUCCESS);
			//result.put(ERROR,ERR_0);
			result.put(MESSAGE, "Lead created Successfully");
			result.put(USER_ID, lead.getId());
			result.put(PINCODE, randomInt);

		}catch(ConstraintViolationException e) {
			e.printStackTrace();
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED);
			result.put(ERROR, ERR_1);
			result.put("message", "One or more mandatory fields are null.");
		} catch(DataIntegrityViolationException e) {
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS,"failed");
			result.put(ERROR, ERR_2);
			result.put("message", "Email already exists.");
		}catch(Exception e) {
			e.printStackTrace();
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS,FAILED);
			result.put(ERROR, ERR_3);
			result.put("message", "Oops..something went wrong.");
		}
		return result;
	}
	
	private String formValidateURL(HttpServletRequest request, String controllerPath){
		StringBuffer sb = new StringBuffer();
		sb.append(env.getProperty(APP_URL)).append(controllerPath);
		return sb.toString();
	}
	private static void sendEmail(List<String> toMailIdsList, String subject, String mailBody){
		MailDto mailDto = new MailDto();
        
        //toMailIdsList.add("gangadhar.ramini@gmail.com");
         
        mailDto.setToMailIdsList(toMailIdsList);
        mailDto.setSubject(subject);
 
        
        mailDto.setMailBody(mailBody);
         
//      List<String> fromMailIdsList = new ArrayList<String>();
//      fromMailIdsList.add("azahrudhin.mohd@gmail.com");
//      mailDto.setFromMailIdsList(fromMailIdsList);
 
        /*Map<String,String> attachmentPathMap = new HashMap<String,String>();
        attachmentPathMap.put("myProg.doc", "C:\\Users\\Azhar\\Dropbox\\Dubai-Related\\Dubai Trails\\mohd.Azahrudhin_JAVA_Profile.doc");
        attachmentPathMap.put("myProg9991.pdf", "C:\\Users\\Azhar\\Dropbox\\Dubai-Related\\Dubai Trails\\Mrg-Cert.pdf");*/
        //mailDto.setAttachmentPathMap(attachmentPathMap);
        MailApi.sendMail(mailDto);
        //MailApi.sendMailWithAttachment(mailDto);
	}

	private static final String ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	public static String randomAlphaNumeric(int count) {
		StringBuilder builder = new StringBuilder();
		while (count-- != 0) {
			int character = (int) (Math.random() * ALPHA_NUMERIC_STRING.length());
			builder.append(ALPHA_NUMERIC_STRING.charAt(character));
		}
		return builder.toString();
	}
	@RequestMapping( 
			method={RequestMethod.POST}, 
			produces = { "application/json", "application/xml" }, 
			value={"/api/sendInvite"})
	
	public Map<String, Object> sendInvite(@RequestBody Map<String, Object> payload, 
			HttpServletRequest request, HttpServletResponse response){
		Map<String, Object> result = new HashMap<>();
		try {
			String emails = (String)payload.get("emails");
			String url = formValidateURL(request, "registration");
			env.getProperty("");
			String messageBody = "<br>Invitation Body goes here, along with registration link</br><a href='"+ url +"' target='_blank' >" + url+"</a>";
			sendEmail(Arrays.asList(emails.split(";")), "Email Invitation", messageBody);
			result.put("status", "success");
		} catch(Exception e ){
			result.put("status", "failed");
		}
		return result;
	}
	
	@RequestMapping( 
			method={RequestMethod.POST}, 
			produces = { "application/json", "application/xml" }, 
			value={"/rest/activateUser"})
	public Map<String, Object> activateUser(@RequestBody Map<String, Object> payload, 
			HttpServletRequest request, HttpServletResponse res){
		Map<String, Object> result = new HashMap<>();
		Integer userId = null;
		String password = null;
				
		try {
			userId = (Integer)payload.get("userId");
			password = (String)payload.get("password");	
				if( userId == null || password == null){
					return ResponseProcessUtil.setError(result, ERR_1, "userId and/or password attribute missing.", res);
				}

			Lead lead = leadDao.getLeadById(userId.longValue());
			if(lead == null){
				return ResponseProcessUtil.setError(result, ERR_2, "Invalid user or User does not exists.", res);
			}
		
			lead.setPassword(password);
			lead.setIsActive("Y");
			leadDao.update(lead);

			result.put(STATUS,SUCCESS);
			result.put(MESSAGE, "User activated successfully.");
			return ResponseProcessUtil.setSuccess(result, "User activated successfully.");
			
		}catch(NumberFormatException e) {
			return ResponseProcessUtil.setError(result, ERR_2, "Invalid user or User does not exists.", res);
		}catch(Exception e) {
			return ResponseProcessUtil.setError(result, ERR_3, "Unable to validate user at this time.", res);
		}
	}
}
