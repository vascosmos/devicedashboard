package com.vascosmos.scm.api.dao;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.vascosmos.scm.api.models.Lead;

@Repository
@Transactional
public class LeadDao {

	 @PersistenceContext
	 private EntityManager entityManager;
	/**
	 *  Save lead info
	 */
	 public void create(Lead leads){
		 entityManager.persist(leads);
	 }
	
	 /**
	  * Get lead by validate token.
	  * @param token
	  */
	 public Lead getLeadbyRandom(String token){
		 return (Lead)entityManager.createQuery(
			        "from Lead where randomString = :token")
			        .setParameter("token", token)
			        .getSingleResult();
	 }
	 
	 /**
	  * Get Lead by id.
	  * @param id
	  * @return
	  */
	 public Lead getLeadById(Long id){
		 return entityManager.find(Lead.class, id);
	 }
	 
	 /**
	  * 
	  * @param email
	  * @return
	  */
	 public Lead getLeadByEmail(String email){
		 return (Lead)entityManager.createQuery(
			        "from Lead where email = :email")
			        .setParameter("email", email)
			        .getSingleResult();
	 }
	 
	 public void update(Lead lead){
		 entityManager.merge(lead);
	 }

}
