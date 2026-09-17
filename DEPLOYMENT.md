# SecuPOS Deployment

## 1. Architecture

GitHub Actions builds the React/Vite frontend and deploys `frontend/dist` to Netlify. The backend is built as a Java 17 container, pushed to an Azure Container Registry, and deployed to an existing Azure App Service for Containers. Spring Boot connects to Aiven MySQL over the Aiven TLS endpoint.

No Azure resource names, URLs, subscription IDs, or production frontend domains are committed here. They must be supplied through GitHub/Azure configuration.

## 2. Local development

Backend:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="local"
$env:MYSQL_HOST="localhost"
$env:MYSQL_PORT="3306"
$env:MYSQL_DATABASE="point_of_sale_db"
$env:MYSQL_USERNAME="root"
$env:MYSQL_PASSWORD=""
$env:JWT_SECRET="use-a-local-development-secret"
.\mvnw.cmd spring-boot:run
```

The API is available at `http://localhost:8080/api`. The frontend defaults to the same API URL:

```powershell
cd frontend
npm ci
npm run dev
```

For Docker Compose, run `docker compose up --build`. Compose uses `host.docker.internal` so the container can reach a MySQL server running on the host. Override `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USERNAME`, and `MYSQL_PASSWORD` when using Aiven instead.

## 3. Environment variables

Backend local and production use `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USERNAME`, and `MYSQL_PASSWORD`. Production additionally requires `JWT_SECRET` and either `CORS_ALLOWED_ORIGINS` or `FRONTEND_URL`. `PORT` is optional and defaults to `8080`.

Frontend uses only `VITE_API_BASE_URL`; Vite values are public browser configuration and must never contain database credentials or signing secrets. Start from `backend/.env.example` and `frontend/.env.example`; they contain placeholders only.

## 4. Aiven MySQL

Use the Aiven service's TLS connection details in Azure App Service settings:

- `MYSQL_HOST`: Aiven hostname
- `MYSQL_PORT`: Aiven port
- `MYSQL_DATABASE`: Aiven database name
- `MYSQL_USERNAME`: Aiven username
- `MYSQL_PASSWORD`: Aiven password stored only in Azure App Service configuration

The `prod` profile builds `jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?sslMode=REQUIRED`. The existing `spring.jpa.hibernate.ddl-auto=update` behavior is retained; no destructive schema setting was introduced. Flyway and Liquibase are not present.

## 5. Docker

Build and run locally from the repository root:

```powershell
docker build -t secupos-backend ./backend
docker run --rm -p 8080:8080 `
  -e SPRING_PROFILES_ACTIVE=local `
  -e MYSQL_HOST=host.docker.internal `
  -e MYSQL_PORT=3306 `
  -e MYSQL_DATABASE=point_of_sale_db `
  -e MYSQL_USERNAME=root `
  -e MYSQL_PASSWORD= `
  secupos-backend
```

The image runs as non-root, exposes port 8080, and has a health check at `/api/actuator/health`.

## 6. GitHub Actions

- `backend-ci.yml`: Java 17 Maven verification on backend pull requests and pushes to `main`.
- `backend-docker.yml`: Docker Buildx build validation on backend pull requests and pushes to `main`.
- `backend-deploy.yml`: runs after successful `Backend CI` on `main` or manually, pushes to ACR, updates App Service, and verifies health.
- `frontend-ci.yml`: Node 20 install/build, optional lint/tests, and Netlify production deploy only on `main`.

Pull requests never deploy production.

## 7. GitHub configuration

Add these repository or production-environment secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

Add these repository or production-environment variables:

- `AZURE_RESOURCE_GROUP`
- `AZURE_WEBAPP_NAME`
- `ACR_NAME`
- `ACR_LOGIN_SERVER`
- `AZURE_HEALTH_URL` (optional; otherwise the workflow uses the default App Service hostname)

The Azure service principal must use a federated GitHub OIDC credential. Grant it only the required resource-group deployment permissions; grant the App Service managed identity `AcrPull` on the ACR.

## 8. Azure App Service setup

Create or select an existing Linux Java/container App Service and an ACR. Do not invent names in the workflow. In App Service **Configuration**, add these application settings:

- `SPRING_PROFILES_ACTIVE=prod`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS` set to the exact Netlify origin, such as `https://your-site.example` (without a path)
- `WEBSITES_PORT=8080`

Enable a system-assigned managed identity on the App Service and assign it `AcrPull` on the ACR. Configure the GitHub OIDC identity with access to update the resource group and push to ACR. Set the App Service health check path to `/api/actuator/health`.

The workflow uses Azure CLI after `azure/login@v2` and does not contain subscription, registry, database, or JWT values.

## 9. Netlify setup

Create/select the Netlify site and connect the GitHub repository. The committed `netlify.toml` sets base directory `frontend`, build command `npm run build`, and publish directory `dist`. Add the Netlify environment variable:

- `VITE_API_BASE_URL=https://<your-app-service-host>/api`

The exact Azure hostname is intentionally not committed. `frontend/public/_redirects` and `netlify.toml` preserve React Router direct navigation.

## 10. Health check and logs

The health endpoint is `GET /api/actuator/health` and exposes no details. Use Azure App Service **Log stream** or:

```powershell
az webapp log tail --resource-group <resource-group> --name <web-app-name>
```

Never enable request-header, token, password, or customer-data logging in production.

## 11. Rollback

Use App Service deployment history or redeploy a prior immutable ACR image tag (the workflow tags images with the commit SHA). Restore the previous image through App Service container configuration, restart the app, and verify `/api/actuator/health`.

## 12. Troubleshooting and security

- A missing required environment variable causes the production Spring context to fail rather than silently using a credential fallback.
- A CORS failure usually means the Netlify origin does not exactly match `CORS_ALLOWED_ORIGINS`.
- A database failure should be checked in Aiven for TLS, allowlist, hostname, port, and credentials.
- Rotate any credentials that were previously committed to Git, especially the old JWT signing value and any database password. Do not print or add those values to this repository.
- `application-prod.properties`, Dockerfiles, Compose, and workflows contain no production secret values.
- The repository currently has an existing Mockito test failure unrelated to deployment; CI correctly remains fail-closed until that test is repaired.

## 13. Git commands

Review before committing:

```powershell
git status
git diff --check
git diff
```

Then commit and push from the repository root:

```powershell
git add .
git commit -m "Add production CI/CD deployment setup"
git push origin main
```

Review the staged diff and secret scan before running these commands.
