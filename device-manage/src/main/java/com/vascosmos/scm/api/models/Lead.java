package com.vascosmos.scm.api.models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Represents an User for this web application.
 */
@Entity
@Table(name = "lead")
public class Lead {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	
    @NotNull
	private String first;
    
    @NotNull
	private String last;
    
    @NotNull
	private String company;
    
    @NotNull
	private String email;
    
    @NotNull
	private String phone;
    
    @NotNull
	private String country;
    
    @NotNull
	private String state;
    
    @NotNull
	private String expectedDepSize;
    
	private String randomString;
	
	private String isActive;
	
	private String password;
    
    private Integer pincode;
    
    public Lead(){
    }
    
    public Lead(String first, String last, String company, String email,
    			 String phone, String country, String state, String expectedDepSize){
    	this.first = first;
    	this.last = last;
    	this.company = company;
    	this.email = email;
    	this.phone = phone;
    	this.country = country;
    	this.state = state;
    	this.expectedDepSize = expectedDepSize;
    }

    public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getFirst() {
		return first;
	}
	public void setFirst(String first) {
		this.first = first;
	}
	public String getLast() {
		return last;
	}
	public void setLast(String last) {
		this.last = last;
	}
	public String getCompany() {
		return company;
	}
	public void setCompany(String company) {
		this.company = company;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getExpectedDepSize() {
		return expectedDepSize;
	}
	public void setExpectedDepSize(String expectedDepSize) {
		this.expectedDepSize = expectedDepSize;
	}
	
	public String getRandomString() {
		return randomString;
	}

	public void setRandomString(String randomString) {
		this.randomString = randomString;
	}

	public String getIsActive() {
		return isActive;
	}

	public void setIsActive(String isActive) {
		this.isActive = isActive;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
	public Integer getPincode() {
		return pincode;
	}

	public void setPincode(Integer pincode) {
		this.pincode = pincode;
	}

	@Override
	public String toString() {
		return String.format(
                "Lead[id=%d, firstName='%s', lastName='%s', lastName='%s', company='%s', email='%s', phone='%s', country='%s', "
                + "state='%s', expectedDepSize='%s', randomString='%s', isAcitve='%s', password='%s', pincode='%d']",
                id, first, last, company, email, phone, country, state, expectedDepSize, randomString, isActive, pincode);
	}
	
}
