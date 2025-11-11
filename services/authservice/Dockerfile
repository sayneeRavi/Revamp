FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and project files
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for speed)
RUN ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Expose service port
EXPOSE 8081

# Copy built jar
COPY --from=build /app/target/*.jar /app/app.jar

# Default profile/port can be overridden with envs
ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=8081 -jar /app/app.jar"]
