package com.revamp.employee.employee.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Value("${EMPLOYEE_MONGO_DATABASE:EAD-Employes}")
    private String databaseName;

    @Bean
    @Primary
    public MongoClient mongoClient() {
        // Validate MongoDB URI is set
        if (mongoUri == null || mongoUri.trim().isEmpty()) {
            throw new IllegalStateException(
                "\n" +
                "=================================================================\n" +
                "ERROR: MongoDB URI is not configured in application.properties!\n" +
                "=================================================================\n" +
                "Please set spring.data.mongodb.uri in application.properties:\n" +
                "  spring.data.mongodb.uri=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/EAD-Employes?retryWrites=true&w=majority\n\n" +
                "The database name should be included in the URI.\n" +
                "=================================================================\n"
            );
        }
        
        System.out.println("========================================");
        System.out.println("Creating MongoClient for EmployeeService");
        System.out.println("MongoDB URI: " + mongoUri.replaceAll(":[^:@]+@", ":****@"));
        System.out.println("========================================");
        
        MongoClient mongoClient = MongoClients.create(mongoUri);
        System.out.println("✓ MongoClient created successfully");
        return mongoClient;
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        // Extract database name from URI if present, otherwise use configured default
        String dbName = databaseName;
        if (mongoUri.contains("/")) {
            String[] parts = mongoUri.split("/");
            if (parts.length > 1) {
                String dbPart = parts[parts.length - 1];
                if (dbPart.contains("?")) {
                    dbName = dbPart.split("\\?")[0];
                } else if (!dbPart.trim().isEmpty()) {
                    dbName = dbPart;
                }
            }
        }
        
        System.out.println("========================================");
        System.out.println("Creating mongoTemplate for EmployeeService");
        System.out.println("Database Name: " + dbName);
        System.out.println("Collections: employees, Details, tasks, notifications, timelogs");
        System.out.println("========================================");
        
        MongoTemplate template = new MongoTemplate(mongoClient, dbName);
        System.out.println("✓ mongoTemplate created successfully for database: " + dbName);
        return template;
    }
}

