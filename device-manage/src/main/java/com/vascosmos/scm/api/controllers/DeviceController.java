package com.vascosmos.scm.api.controllers;

import static com.vascosmos.scm.util.ApplicationConstants.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.PathParam;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.vascosmos.scm.api.dao.DeviceDao;
import com.vascosmos.scm.api.dao.LeadDao;
import com.vascosmos.scm.api.models.Device;
import com.vascosmos.scm.api.models.Lead;
import com.vascosmos.scm.util.ResponseProcessUtil;

@RestController
public class DeviceController {
	
	@Autowired
	DeviceDao deviceDao;
	
	@Autowired
	LeadDao leadDao;
	
	@RequestMapping( 
			method={RequestMethod.PUT}, 
			produces = { "application/json", "application/xml" }, 
			value={"/api/device"})
	public Map<String, Object> createDevice(@RequestBody Device device,HttpServletResponse response){
		Map<String, Object> result = new HashMap<>();
		
		try{
			//1. create device.
			deviceDao.create(device);
			ResponseProcessUtil.setSuccess(result, "Device created Successfully");
		}catch(ConstraintViolationException e) {
			e.printStackTrace();
			ResponseProcessUtil.setError(result, ERR_1, "One or more mandatory fields are null.", response);
		}
		catch(Exception e) {
			e.printStackTrace();
			ResponseProcessUtil.setError(result, ERR_2, "Unable to add device.", response);
		}
		return result;
	}
	
	@RequestMapping( 
			method={RequestMethod.POST}, 
			produces = { "application/json", "application/xml" }, 
			value={"/api/device"})
	public Map<String, Object> updateDevice(@RequestBody Device device,HttpServletResponse response){
		Map<String, Object> result = new HashMap<>();
		
		try{
			//1. Check if the device Id is passed in request.
			if(device.getId() == null ) {
				return ResponseProcessUtil.setError(result, ERR_1, "Device id is null or invalid.", response);
			}
			
			Device dbDevice = deviceDao.getDeviceById(device.getId());
			if(dbDevice == null) {
				return ResponseProcessUtil.setError(result, ERR_1, "Device id is null or invalid.", response);
			}
			
			//check if its a device activation call, update it and return success.
			if("N".equalsIgnoreCase(dbDevice.getActive()) && "Y".equalsIgnoreCase(device.getActive())){
				dbDevice.setActive(device.getActive());
			} else {
				if("N".equalsIgnoreCase(dbDevice.getActive())){
					return ResponseProcessUtil.setError(result, ERR_2, "Can't update an inactive device.", response);
				}
				if(device.getLicenseKey() != null) {
					dbDevice.setLicenseKey(device.getLicenseKey());
				}
				
				if(device.getActive() != null) {
					dbDevice.setActive(device.getActive());
				}
			}

			deviceDao.update(dbDevice);
			result.put(STATUS, SUCCESS);
			result.put(MESSAGE, "Device updated Successfully");

		}catch(ConstraintViolationException e) {
			e.printStackTrace();
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED);
			result.put(MESSAGE, "One or more mandatory fields are null.");
		}
		catch(Exception e) {
			e.printStackTrace();
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED);
			result.put(MESSAGE, "Oops..somthing went wrong.");
		}
		return result;
	} 
	
	@RequestMapping( 
			method={RequestMethod.DELETE}, 
			produces = { "application/json", "application/xml" }, 
			value={"/api/device"})
	public Map<String, Object> deleteDevice(@RequestBody Map<String, Object> payload,
			HttpServletResponse response){
		Map<String, Object> result = new HashMap<>();
		
		try{
			//1. create device.
			deviceDao.delete(new Long((Integer)payload.get("id")));
			result.put(STATUS, "success"); 
			result.put(MESSAGE, "Device deleted Successfully");

		}catch(ConstraintViolationException e) {
			e.printStackTrace();
			result.put(STATUS, FAILED); 
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(MESSAGE, "One or more mandatory fields are null.");
		}catch(Exception e) {
			e.printStackTrace();
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED); 
			result.put(MESSAGE, "Oops..somthing went wrong.");
		}
		return result;
	} 
	
	@RequestMapping( 
			method={RequestMethod.POST}, 
			produces = { "application/json", "application/xml" }, 
			value={"/api/devices/userId"})
	public Map<String, Object> getAllDevicesForUser(@RequestBody Map<String, Object> payload, HttpServletResponse response){
		Map<String, Object> result = new HashMap<>();
		List<Device> devices = new ArrayList<>();
		Integer userId = null;
		try{
			userId = (Integer)payload.get("userId");
			
			if( userId == null ){
				result.put(STATUS, FAILED);
				result.put(MESSAGE, "userId is null or not valid.");
				result.put(ERROR, ERR_1);
				return result;
			}
			
		}catch(Exception e) {
			result.put(STATUS, FAILED);
			result.put(MESSAGE, "userId is null or not valid.");
			result.put(ERROR, ERR_1);
			return result;
		}
				
		try{
			Lead lead = leadDao.getLeadById(userId.longValue());
			
			if(lead == null) {
				result.put(STATUS, FAILED);
				result.put(MESSAGE, "User id does not exists.");
				result.put(ERROR, ERR_2);
				return result;
				
			}

			devices = deviceDao.getDevicesForUser(userId.longValue());
			if(devices.size()>0) {
				result.put("device", devices);
				result.put(STATUS, SUCCESS);
			}
		}catch(Exception e){
			e.printStackTrace();
			response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
			result.put(STATUS, FAILED);
			result.put(ERROR, ERR_3);
			result.put(MESSAGE, "Unable to get device.");
		}
		return result;
	}

}
