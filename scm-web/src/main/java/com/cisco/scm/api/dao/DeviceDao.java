package com.cisco.scm.api.dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.OptimisticLockException;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.cisco.scm.api.models.Device;

@Repository
@Transactional
public class DeviceDao {

	 @PersistenceContext
	 private EntityManager entityManager;
	 
	 /**
	  * Create Device
	  * @param device
	  */
	 public void create(Device device){
		 entityManager.persist(device);
	 }
	 
	 /**
	  * Update Device.
	  * @param device
	  */
	 public void update(Device device){
		 entityManager.merge(device);
	 }
	 
	 /**
	  * Get all devices for user
	  * @param emailId
	  * @return
	  */
	  @SuppressWarnings("unchecked")
	 public List<Device> getDevicesForUser(Long id){
		 return(List<Device>)entityManager.createQuery("select d from Lead l,Device d where l.id = :id and l.email=d.email")
					 .setParameter("id", id).getResultList();
	 }
	  
	 /**
	  * Get device by id.
	  * @param id
	  * @return
	  */
	  
	 public Device getDeviceById(Long id){
		return entityManager.find(Device.class, id);
	 }

	 /**
	  * Delete a device
	  * @param device
	  */
	 public void delete(Long id){
		 
		 int isSuccessful = entityManager.createQuery("delete from devices d where d.id=:id")
         .setParameter("id", id)
         .executeUpdate();
		 if (isSuccessful == 0) {
		        throw new OptimisticLockException(" device modified concurrently");
		    }
	 }
}
