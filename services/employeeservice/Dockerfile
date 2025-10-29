FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8082

# Run the application
CMD ["java", "-jar", "target/employee-service-0.0.1-SNAPSHOT.jar"]