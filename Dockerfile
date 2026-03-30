FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY backend/gradle gradle
COPY backend/gradlew .
COPY backend/build.gradle .
COPY backend/src src
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/promonts-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
