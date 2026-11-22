# Cloud Task Manager

A starter full-stack task management application for Azure deployment.

## Features
- Create, view, edit, complete, and delete tasks
- Task status and priority
- Optional due dates
- Upload one attachment per task
- Local file storage for development
- Azure Blob Storage using Managed Identity in Azure
- H2 file-based database for a lightweight initial deployment

## Technology
- Frontend: React + TypeScript + Vite
- Backend: Java 21 + Spring Boot 3.5 + Spring Data JPA
- Database: H2 file database
- Object storage: Azure Blob Storage
- Hosting: Ubuntu VM + Nginx

## Project structure
- `frontend/` - React application
- `backend/` - Spring Boot REST API

## Requirements
- Java 21
- Maven 3.9+
- Node.js 20+ and npm
- Git

## 1. Run the backend locally

Open PowerShell in the `backend` directory:

```powershell
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

Health check: `http://localhost:8080/api/health`

The local H2 database is stored under `backend/data/`.
For local development, attachments are stored under `backend/uploads/`.

## 2. Run the frontend locally

Open another PowerShell window in `frontend`:

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend uses `VITE_API_BASE_URL`, defaulting to `http://localhost:8080/api`.

## 3. Azure Blob Storage configuration

The application uses local file storage by default. To use Azure Blob Storage, set these environment variables for the backend:

```text
AZURE_STORAGE_ENABLED=true
AZURE_STORAGE_ACCOUNT_NAME=codomaxmodule03storage
AZURE_STORAGE_CONTAINER_NAME=app-uploads
```

The backend creates a Blob client using Azure `DefaultAzureCredential`.
- On your Azure VM, this uses the VM's system-assigned Managed Identity.
- Locally, it can use an authenticated Azure CLI session (`az login`).

The VM Managed Identity needs the **Storage Blob Data Contributor** role on the storage account or container.

Do not put storage account keys, passwords, or access tokens in source code or GitHub.

## 4. Build frontend for production

In `frontend`:

```powershell
npm install
npm run build
```

The production files are generated in `frontend/dist/`.

Upload the contents of `dist/` to the VM's Nginx web root (commonly `/var/www/html/`).
Configure Nginx to serve the React app and proxy `/api/` requests to the backend on `127.0.0.1:8080`.

A sample Nginx configuration is in `deployment/nginx-cloud-task-manager.conf`.

## 5. Backend production settings

Set these environment variables on the VM before starting the backend:

```bash
export SPRING_PROFILES_ACTIVE=prod
export AZURE_STORAGE_ENABLED=true
export AZURE_STORAGE_ACCOUNT_NAME=codomaxmodule03storage
export AZURE_STORAGE_CONTAINER_NAME=app-uploads
export SERVER_PORT=8080
```

The `prod` profile uses the same H2 file database by default. This is suitable for a small demonstration, not a high-availability production system. Back up the H2 data directory. For a production system, migrate to a managed database such as Azure Database for PostgreSQL or MySQL after checking student-credit costs.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Get one task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Mark task completed |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/{id}/attachment` | Upload attachment (multipart field `file`) |

## Notes
- This is a starter project. Add authentication and authorization before exposing it publicly.
- The initial H2 database is intentionally lightweight. It is not a substitute for a managed database in a production deployment.
- Azure Blob uploads are private; the API stores the blob name and returns the blob URL. Do not make the container public.
