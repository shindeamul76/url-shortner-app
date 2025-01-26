<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://github.com/shindeamul76/url-shortner-app.git">
   <img src="https://media.licdn.com/dms/image/v2/D560BAQH42HXoIAZWdQ/company-logo_200_200/company-logo_200_200/0/1712558218291/thealteroffice_logo?e=2147483647&v=beta&t=TbwDmIQs8A0K5y6V50ANAKz9X8OZToWkkYtpi1phLC4" alt="Logo">
  </a>

  <h3 align="center">URL Shortner</h3>

  <p align="center">
    Become a Certified Career Planner.
    <br />
    <a href="https://tao-o16p.onrender.com/"><strong>Deployed URL »</strong></a>
    <br />
    <br />
    <a href="https://github.com/shindeamul76/url-shortner-app.git">Discussions</a>
    ·
    <a href="https://www.thealteroffice.com/">Website</a>
    ·
    <a href="https://github.com/shindeamul76/url-shortner-app.git/issues">Issues</a>
    ·
    <a href="https://www.thealteroffice.com/">Roadmap</a>
  </p>
</p>


<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://github.com/shindeamul76/url-shortner-app.git">
   <img src="https://media.licdn.com/dms/image/v2/D560BAQH42HXoIAZWdQ/company-logo_200_200/company-logo_200_200/0/1712558218291/thealteroffice_logo?e=2147483647&v=beta&t=TbwDmIQs8A0K5y6V50ANAKz9X8OZToWkkYtpi1phLC4" alt="Logo">
  </a>

  <h3 align="center">URL Shortner</h3>

  <p align="center">
    Become a Certified Career Planner.
    <br />
    <a href="https://tao-o16p.onrender.com/"><strong>Deployed URL »</strong></a>
    <br />
    <br />
    <a href="https://github.com/shindeamul76/url-shortner-app.git">Discussions</a>
    ·
    <a href="https://www.thealteroffice.com/">Website</a>
    ·
    <a href="https://github.com/shindeamul76/url-shortner-app.git/issues">Issues</a>
    ·
    <a href="https://www.thealteroffice.com/">Roadmap</a>
  </p>
</p>


# URL Shortener Application

A **Custom URL Shortener API** designed to create short URLs from long and cumbersome ones, providing advanced analytics, user authentication via Google Sign-In, rate limiting, and caching for performance optimization. The system is containerized for easy deployment and scalability, making it a reliable solution for URL management.

---

## Features

### 1. **User Authentication**
- Google Sign-In integration for seamless user login.
- Secure token-based authentication.

### 2. **Short URL Creation**
- Generate short URLs for long links.
- Support for custom aliases.
- Group URLs under specific topics for easy categorization.

### 3. **Short URL Redirection**
- Redirect to the original URL based on the short alias.
- Track engagement metrics for each redirect.

### 4. **URL Analytics**
- Retrieve analytics for individual and overall short URLs.
- Insights include:
  - Total clicks, unique users.
  - Click distribution by date.
  - Operating system and device types.

### 5. **Topic-Based Analytics**
- Analyze URLs grouped under specific topics.

### 6. **Caching with Redis**
- Improve API performance by caching URLs and analytics data.

### 7. **Rate Limiting**
- Restrict the number of short URLs users can create within a specific time frame.

---

## Built With

- **[Nest.js](https://nestjs.com/):** Backend framework.
- **[PostgreSQL](https://www.postgresql.org/):** Relational database.
- **[Prisma.io](https://www.prisma.io/):** Database ORM.
- **[Redis](https://redis.io/):** Caching mechanism.
- **[Swagger](https://swagger.io/):** API documentation.

---

## Getting Started

### Prerequisites

Ensure the following are installed:
- **Node.js**: Version >=18.x
- **PostgreSQL**: Version >=13.x
- **Yarn** _(recommended)_
- **Docker** and **Docker Compose** for quick setup.

### Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/shindeamul76/url-shortner-app.git
```

#### 2. Navigate to the Project Directory

```bash
cd url-shortner-app
```

#### 3. Install Dependencies

```bash
yarn install
```

#### 4. Configure Environment Variables

- Duplicate the `.env.example` file to `.env`:

  ```bash
  cp .env.example .env
  ```

- Update the following keys in the `.env` file:
  - `JWT_SECRET` (use `openssl rand -base64 32` to generate)
  - `SESSION_SECRET` (use `openssl rand -base64 32` to generate)

#### 5. Run Database Migrations

```bash
yarn run prisma:migrate-deploy
```

#### 6. Generate prisma migratioons locally 

```bash
npx prisma generate
```

#### 7. Start the Application

For development:

```bash
yarn run start:dev
```

---

## Quick Setup with Docker

### Prerequisites

Ensure **Docker** and **Docker Compose** are installed.

### Steps

1. Run the Application

```bash
docker-compose up --build
```

2. Access the Application

- Swagger Documentation: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## API Endpoints

### 1. **Create Short URL**
- **Endpoint:** `/api/shorten`
- **Method:** `POST`
- **Description:** Create a short URL with optional custom alias and topic.

#### Request Body:
```json
{
  "longUrl": "https://example.com",
  "customAlias": "example",
  "topic": "retention"
}
```

#### Response:
```json
{
  "shortUrl": "http://localhost:3000/example",
  "createdAt": "2025-01-26T12:00:00.000Z"
}
```

### 2. **Redirect Short URL**
- **Endpoint:** `/api/shorten/{alias}`
- **Method:** `GET`

#### Response:
Redirects to the original URL.

### 3. **Get URL Analytics**
- **Endpoint:** `/api/analytics/{alias}`
- **Method:** `GET`
- **Description:** Retrieve analytics for a specific short URL.

#### Response:
```json
{
  "totalClicks": 100,
  "uniqueUsers": 50,
  "clicksByDate": [
    { "date": "2025-01-20", "clicks": 10 },
    { "date": "2025-01-21", "clicks": 15 }
  ]
}
```

### 4. **Topic-Based Analytics**
- **Endpoint:** `/api/analytics/topic/{topic}`
- **Method:** `GET`

### 5. **Overall Analytics**
- **Endpoint:** `/api/analytics/overall`
- **Method:** `GET`

---

## Testing

### Testing the API Workflow

1. **Login Using Google Authentication**
   - Hit the `/auth/google` API endpoint for user authentication.
   - On successful login, the API will save the `access_token` and `refresh_token` in cookies.
   - The response will also include the `access_token`.

2. **Create a Short URL**
   - Use the `access_token` in the Authorization header as a Bearer token.
   - Hit the `/api/shorten` endpoint with the required payload to create a short URL.

   #### Example Authorization Header:
   ```http
   Authorization: Bearer <access_token>
   ```

   #### Example Request:
   ```json
   {
     "longUrl": "https://example.com",
     "customAlias": "example",
     "topic": "activation"
   }
   ```

3. **Access Analytics APIs**
   - Use the same `access_token` for authentication.
   - Endpoints:
     - `/api/analytics/{alias}`: Get detailed analytics for a specific short URL.
     - `/api/analytics/topic/{topic}`: Get topic-based analytics.
     - `/api/analytics/overall`: Get overall analytics for all URLs.

4. **Redirect Short URL**
   - Access the `/api/shorten/{alias}` endpoint to be redirected to the original URL.

---

## Challenges Faced

### 1. **Database Migrations**
- Solution: Automated using Prisma migrations.

### 2. **Rate Limiting**
- Solution: Leveraged in-memory counters and Redis to enforce limits.

### 3. **Analytics Tracking**
- Solution: Integrated for logging user agent, geolocation, and timestamps.

---

## Deployment

The application can be deployed on cloud platforms such as [Render](https://render.com).

Deployment URL: **[Backend URL](https://tao-o16p.onrender.com/)**







