FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests clean package

FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app
EXPOSE 8082
ENV JAVA_OPTS="-Xms256m -Xmx512m"
COPY --from=build /app/target/*.jar /app/app.jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=8082 -jar /app/app.jar"]
