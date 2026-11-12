# Étape 1 : Render compile le projet avec Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q clean package -DskipTests

# Étape 2 : image légère qui lance psm.jar
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/psm.jar psm.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Xmx300m -Xss512k -XX:+UseSerialGC -jar psm.jar --server.port=${PORT:-8080} --spring.profiles.active=prod"]