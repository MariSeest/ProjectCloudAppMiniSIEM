plugins {
    id("org.springframework.boot") version "3.4.2"
    id("io.spring.dependency-management") version "1.1.7"
    java
}

group = "it.lilsec"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

extra["springCloudVersion"] = "2024.0.1"

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
    }
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  implementation("org.springframework.cloud:spring-cloud-starter-gateway")
  implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("io.projectreactor:reactor-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
