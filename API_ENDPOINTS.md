# API Endpoints Reference for VPS Deployment

This document lists all the REST API endpoints your Spring Boot backend must implement for the Juveboxd frontend.

## Base URL

**Local Development:** `http://localhost:8080/api`
**VPS Production:** `https://your-domain.com/api` or `http://your-vps-ip:8080/api`

---

## Endpoints

### 1. Get All Reviews

**Endpoint:** `GET /api/reviews`

**Description:** Fetches all reviews from the database, sorted by timestamp (newest first)

**Request:**
```
GET /api/reviews
Accept: application/json
```

**Response:** `200 OK`
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nickname": "João Silva",
    "rating": 4.5,
    "comment": "Show incrível! Adorei!",
    "timestamp": 1699564800000
  },
  {
    "id": "987e6543-e21b-12d3-a456-426614174001",
    "nickname": "Maria Santos",
    "rating": 5.0,
    "comment": "Melhor show que já vi!",
    "timestamp": 1699478400000
  }
]
```

**Notes:**
- Returns empty array `[]` if no reviews exist
- Reviews should be ordered by `timestamp` descending (newest first)

---

### 2. Create New Review

**Endpoint:** `POST /api/reviews`

**Description:** Creates a new review and saves it to the database

**Request:**
```
POST /api/reviews
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "nickname": "João Silva",
  "rating": 4.5,
  "comment": "Show incrível! Adorei!"
}
```

**Field Requirements:**
- `nickname` (required): String, 1-100 characters
- `rating` (required): Number, between 0.5 and 5.0 (supports half stars: 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
- `comment` (optional): String, maximum 300 characters, can be empty string ""

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nickname": "João Silva",
  "rating": 4.5,
  "comment": "Show incrível! Adorei!",
  "timestamp": 1699564800000
}
```

**Notes:**
- `id` should be auto-generated (UUID recommended)
- `timestamp` should be auto-generated (current time in milliseconds)
- Backend must validate all fields before saving

**Error Response:** `400 Bad Request`
```json
{
  "message": "Validation failed",
  "errors": {
    "nickname": "Nickname is required",
    "rating": "Rating must be between 0.5 and 5.0"
  }
}
```

---

### 3. Get Review by ID (Optional - for future use)

**Endpoint:** `GET /api/reviews/{id}`

**Description:** Fetches a single review by its ID

**Request:**
```
GET /api/reviews/123e4567-e89b-12d3-a456-426614174000
Accept: application/json
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nickname": "João Silva",
  "rating": 4.5,
  "comment": "Show incrível! Adorei!",
  "timestamp": 1699564800000
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "Review not found"
}
```

---

### 4. Delete Review (Optional - for future admin panel)

**Endpoint:** `DELETE /api/reviews/{id}`

**Description:** Deletes a review by its ID

**Request:**
```
DELETE /api/reviews/123e4567-e89b-12d3-a456-426614174000
```

**Response:** `204 No Content`

**Error Response:** `404 Not Found`
```json
{
  "message": "Review not found"
}
```

---

## CORS Configuration (CRITICAL!)

Your Spring Boot backend MUST configure CORS to allow requests from your frontend domains:

### Allowed Origins:
```java
// Development
"http://localhost:3000"

// Production (GitHub Pages)
"https://arreguy.github.io"
```

### Allowed Methods:
```
GET, POST, DELETE, OPTIONS
```

### Allowed Headers:
```
Content-Type, Accept, Authorization
```

### Example CORS Configuration:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "https://arreguy.github.io"
                )
                .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## VPS Deployment Checklist

### Backend Setup:

1. **Install Java 17 or higher** on your VPS
   ```bash
   sudo apt update
   sudo apt install openjdk-17-jdk
   ```

2. **Install and configure database** (PostgreSQL recommended)
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

3. **Update application.properties** for production:
   ```properties
   server.port=8080

   # Database
   spring.datasource.url=jdbc:postgresql://localhost:5432/juveboxd
   spring.datasource.username=your_db_user
   spring.datasource.password=your_db_password

   # JPA
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=false
   ```

4. **Build your Spring Boot application**:
   ```bash
   ./mvnw clean package
   ```

5. **Run on VPS**:
   ```bash
   java -jar target/juveboxd-backend-0.0.1-SNAPSHOT.jar
   ```

6. **Setup as systemd service** (recommended for auto-restart):
   ```bash
   sudo nano /etc/systemd/system/juveboxd.service
   ```

   ```ini
   [Unit]
   Description=Juveboxd Backend
   After=syslog.target

   [Service]
   User=your_user
   ExecStart=/usr/bin/java -jar /path/to/your/app.jar
   SuccessExitStatus=143
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable juveboxd
   sudo systemctl start juveboxd
   ```

### Frontend Configuration:

1. **Update environment variable** for production deployment:

   Create a new environment variable in your GitHub repository:
   - Go to: Settings → Secrets and variables → Actions → Variables
   - Add: `NEXT_PUBLIC_API_URL` = `http://your-vps-ip:8080/api`

   Or if using a domain with SSL:
   - Add: `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com/api`

2. **Update GitHub Actions workflow** to use the variable:
   ```yaml
   - name: Build with Next.js
     env:
       NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
     run: pnpm run build
   ```

### Security Recommendations:

1. **Use HTTPS** (highly recommended):
   - Install Nginx as reverse proxy
   - Get free SSL certificate from Let's Encrypt
   - Configure Nginx to proxy to Spring Boot on port 8080

2. **Setup firewall**:
   ```bash
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw allow 8080/tcp  # Spring Boot (if not using Nginx)
   sudo ufw enable
   ```

3. **Add rate limiting** to prevent abuse

4. **Add authentication** if you plan to add admin features

---

## Testing Your Endpoints

### Test with cURL:

```bash
# Test GET all reviews
curl http://your-vps-ip:8080/api/reviews

# Test POST new review
curl -X POST http://your-vps-ip:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Test User",
    "rating": 4.5,
    "comment": "Testing from cURL"
  }'

# Test GET by ID
curl http://your-vps-ip:8080/api/reviews/{id}

# Test DELETE
curl -X DELETE http://your-vps-ip:8080/api/reviews/{id}
```

### Test CORS:

```bash
curl -X OPTIONS http://your-vps-ip:8080/api/reviews \
  -H "Origin: https://arreguy.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Look for these headers in the response:
```
Access-Control-Allow-Origin: https://arreguy.github.io
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
```

---

## Quick Start Summary

### Minimum Required Endpoints:

✅ **Essential (must implement):**
1. `GET /api/reviews` - Get all reviews
2. `POST /api/reviews` - Create new review

✅ **Recommended (for complete functionality):**
3. `GET /api/reviews/{id}` - Get single review
4. `DELETE /api/reviews/{id}` - Delete review

✅ **Critical Configuration:**
- CORS setup with GitHub Pages domain
- Database connection
- Proper validation and error handling

Once these endpoints are live on your VPS, update the `NEXT_PUBLIC_API_URL` environment variable in your frontend deployment, and your application will be fully integrated!
