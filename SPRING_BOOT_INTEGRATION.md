# Spring Boot Backend Integration Guide

This document provides instructions for integrating the Juveboxd Next.js frontend with a Spring Boot backend.

## Backend Requirements

The frontend expects a REST API with the following endpoints:

### API Endpoints

#### 1. Get All Reviews
```
GET /api/reviews
```
**Response:**
```json
[
  {
    "id": "string",
    "nickname": "string",
    "rating": 0.0,
    "comment": "string",
    "timestamp": 1234567890
  }
]
```

#### 2. Create Review
```
POST /api/reviews
Content-Type: application/json
```
**Request Body:**
```json
{
  "nickname": "string",
  "rating": 0.0,
  "comment": "string"
}
```
**Response:**
```json
{
  "id": "string",
  "nickname": "string",
  "rating": 0.0,
  "comment": "string",
  "timestamp": 1234567890
}
```

#### 3. Get Review by ID (Optional)
```
GET /api/reviews/{id}
```
**Response:**
```json
{
  "id": "string",
  "nickname": "string",
  "rating": 0.0,
  "comment": "string",
  "timestamp": 1234567890
}
```

#### 4. Delete Review (Optional)
```
DELETE /api/reviews/{id}
```
**Response:** 204 No Content

---

## Spring Boot Implementation Example

### 1. Entity Class

```java
package com.example.juveboxd.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private Double rating;

    @Column(length = 300)
    private String comment;

    @Column(nullable = false)
    private Long timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = System.currentTimeMillis();
        }
    }
}
```

### 2. Repository Interface

```java
package com.example.juveboxd.repository;

import com.example.juveboxd.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findAllByOrderByTimestampDesc();
}
```

### 3. DTO Classes

```java
package com.example.juveboxd.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewRequest {

    @NotBlank(message = "Nickname is required")
    @Size(min = 1, max = 100, message = "Nickname must be between 1 and 100 characters")
    private String nickname;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "0.5", message = "Rating must be at least 0.5")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    private Double rating;

    @Size(max = 300, message = "Comment must not exceed 300 characters")
    private String comment;
}
```

### 4. Service Class

```java
package com.example.juveboxd.service;

import com.example.juveboxd.dto.CreateReviewRequest;
import com.example.juveboxd.model.Review;
import com.example.juveboxd.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public Review createReview(CreateReviewRequest request) {
        Review review = new Review();
        review.setNickname(request.getNickname());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return reviewRepository.save(review);
    }

    public Review getReviewById(String id) {
        return reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    @Transactional
    public void deleteReview(String id) {
        reviewRepository.deleteById(id);
    }
}
```

### 5. Controller Class

```java
package com.example.juveboxd.controller;

import com.example.juveboxd.dto.CreateReviewRequest;
import com.example.juveboxd.model.Review;
import com.example.juveboxd.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@Valid @RequestBody CreateReviewRequest request) {
        Review review = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 6. CORS Configuration (IMPORTANT!)

```java
package com.example.juveboxd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",           // Next.js dev server
                    "https://arreguy.github.io"        // GitHub Pages (production)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 7. Global Exception Handler

```java
package com.example.juveboxd.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        errors.put("message", "Validation failed");

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        errors.put("errors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

### 8. Application Properties

```properties
# application.properties

# Server Configuration
server.port=8080

# Database Configuration (H2 for development)
spring.datasource.url=jdbc:h2:mem:juveboxd
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# H2 Console (optional, for development)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# For PostgreSQL (Production)
# spring.datasource.url=jdbc:postgresql://localhost:5432/juveboxd
# spring.datasource.username=your_username
# spring.datasource.password=your_password
# spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### 9. Maven Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Spring Boot Starter Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- H2 Database (Development) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- PostgreSQL Driver (Production) -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## Frontend Configuration

### Development (Local)

1. Create a `.env.local` file in the frontend root:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

2. Start the Spring Boot backend:
```bash
./mvnw spring-boot:run
```

3. Start the Next.js dev server:
```bash
npm run dev
```

### Production

1. Update the `.env.local` file or set environment variables in your deployment platform:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

2. For GitHub Pages, you'll need to deploy your Spring Boot backend separately to a hosting service like:
   - AWS (Elastic Beanstalk, EC2)
   - Google Cloud Platform
   - Heroku
   - Railway
   - Render

3. Update the CORS configuration in Spring Boot to include your GitHub Pages domain

---

## Testing the Integration

### Using cURL

```bash
# Get all reviews
curl http://localhost:8080/api/reviews

# Create a review
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Test User",
    "rating": 4.5,
    "comment": "Great show!"
  }'

# Get review by ID
curl http://localhost:8080/api/reviews/{id}

# Delete review
curl -X DELETE http://localhost:8080/api/reviews/{id}
```

### Using the Frontend

1. Start both backend and frontend
2. Navigate to `http://localhost:3000`
3. Fill out the review form and submit
4. The review should be saved to the database and appear in the carousel

---

## Troubleshooting

### CORS Issues
- Make sure the CORS configuration includes your frontend domain
- Check browser console for CORS errors
- Verify that the backend is accepting requests from the frontend origin

### Connection Refused
- Ensure the Spring Boot backend is running on port 8080
- Check that `NEXT_PUBLIC_API_URL` is correctly set
- Verify firewall settings aren't blocking the connection

### 404 Not Found
- Verify the API endpoints match the expected paths (`/api/reviews`)
- Check Spring Boot logs for routing issues
- Ensure the controller is properly annotated with `@RestController`

### Database Issues
- For H2, access the console at `http://localhost:8080/h2-console`
- Check that JPA entities are correctly mapped
- Verify database connection settings in `application.properties`

---

## Next Steps

1. Implement authentication/authorization if needed
2. Add pagination for reviews
3. Implement review moderation
4. Add image upload functionality
5. Set up production database (PostgreSQL, MySQL, etc.)
6. Deploy backend to a cloud provider
7. Configure SSL/HTTPS for production
