package com.revamp.employee.employee.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.revamp.employee.employee.model.EmployeeDetail;

@Service
public class EmployeeDetailService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public EmployeeDetail save(EmployeeDetail detail) {
        try {
            System.out.println("===== Saving Employee Detail =====");
            System.out.println("Full Name: " + detail.getFullName());
            System.out.println("Email: " + detail.getEmail());
            System.out.println("Phone: " + detail.getPhoneNumber());
            System.out.println("Skills: " + java.util.Arrays.toString(detail.getSkills()));
            
            // Verify we're using the correct MongoTemplate
            System.out.println("Using mongoTemplate (should connect to EAD-Employes)");
            
            EmployeeDetail saved = mongoTemplate.save(detail);
            System.out.println("✓ Saved successfully with ID: " + saved.getId());
            System.out.println("✓ Collection: Details");
            System.out.println("✓ Database: EAD-Employes");
            System.out.println("================================");
            return saved;
        } catch (Exception e) {
            System.err.println("ERROR saving employee detail: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Optional<EmployeeDetail> findByUserId(String userId) {
        Query query = Query.query(Criteria.where("userId").is(userId));
        EmployeeDetail detail = mongoTemplate.findOne(query, EmployeeDetail.class);
        return Optional.ofNullable(detail);
    }

    public Optional<EmployeeDetail> findByEmail(String email) {
        Query query = Query.query(Criteria.where("email").is(email));
        EmployeeDetail detail = mongoTemplate.findOne(query, EmployeeDetail.class);
        return Optional.ofNullable(detail);
    }

    public boolean existsByEmail(String email) {
        Query query = Query.query(Criteria.where("email").is(email));
        return mongoTemplate.exists(query, EmployeeDetail.class);
    }

    public List<EmployeeDetail> findAllByOrderByFullName() {
        Query query = new Query().with(org.springframework.data.domain.Sort.by("fullName"));
        return mongoTemplate.find(query, EmployeeDetail.class);
    }

    public List<EmployeeDetail> findAll() {
        return mongoTemplate.findAll(EmployeeDetail.class);
    }

    public void delete(String id) {
        Query query = Query.query(Criteria.where("_id").is(id));
        mongoTemplate.remove(query, EmployeeDetail.class);
        System.out.println("✓ Deleted employee detail with ID: " + id + " from EAD-Employes database");
    }

    public EmployeeDetail update(EmployeeDetail detail) {
        System.out.println("===== Updating Employee Detail =====");
        System.out.println("ID: " + detail.getId());
        System.out.println("Full Name: " + detail.getFullName());
        System.out.println("Email: " + detail.getEmail());
        System.out.println("Phone: " + detail.getPhoneNumber());
        System.out.println("Skills: " + java.util.Arrays.toString(detail.getSkills()));
        
        EmployeeDetail updated = mongoTemplate.save(detail);
        System.out.println("✓ Updated successfully in EAD-Employes database");
        System.out.println("================================");
        return updated;
    }
}

