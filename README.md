# Cloud Task Manager

A full-stack cloud-based task management application developed using React, TypeScript, Java Spring Boot, and Microsoft Azure. The application allows users to manage tasks and upload attachments, with files stored securely in Azure Blob Storage.

## Live Application

**Application URL:** http://20.2.80.155

The application is hosted on an Ubuntu Linux virtual machine in Microsoft Azure.

> Note: The current demonstration deployment uses HTTP. HTTPS and authentication should be configured before using the application for sensitive or real-world data.

## Features

- Create, view, edit, and delete tasks
- Mark tasks as completed
- Manage task status and priority
- Set optional task due dates
- Upload attachments to tasks
- Store development attachments locally
- Store Azure deployment attachments in Azure Blob Storage
- Use Managed Identity for Azure Storage authentication
- REST API for task management
- Health-check endpoint for monitoring

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Java 21, Spring Boot 3.5 |
| API | Spring Boot REST API |
| Database | H2 file-based database |
| Object Storage | Azure Blob Storage |
| Authentication to Azure Storage | System-assigned Managed Identity |
| Web Server | Nginx |
| Hosting | Azure Ubuntu Linux VM |
| Version Control | Git and GitHub |

## System Architecture

1. Users access the React frontend through a web browser.
2. Nginx serves the frontend application.
3. Nginx forwards `/api/` requests to the Spring Boot backend.
4. The backend processes task management requests.
5. Task information is stored in the H2 file-based database on the VM.
6. Attachments are stored in Azure Blob Storage.
7. The Azure VM uses its system-assigned Managed Identity to access Blob Storage.

## Project Structure

```text
cloud-task-manager/
├── frontend/       # React + TypeScript application
├── backend/        # Spring Boot REST API
├── deployment/     # Nginx and systemd configuration examples
├── .gitignore
└── README.md
```

## Requirements for Local Development

- Java 21
- Maven 3.9+
- Node.js 20+ and npm
- Git

## Run the Backend Locally

Open a terminal in the `backend` directory.

```bash
mvn spring-boot:run
```

Backend URL:

`http://localhost:8080`

Health check:

`http://localhost:8080/api/health`

The local H2 database and uploaded files are stored under the backend directory.

## Run the Frontend Locally

Open another terminal in the `frontend` directory.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

The frontend uses `VITE_API_BASE_URL` to connect to the backend. Its default development URL is `http://localhost:8080/api`.

## Azure Deployment

The application is deployed using the following Azure services and components:

- Azure Virtual Machine running Ubuntu Server 24.04
- Nginx for frontend hosting and API reverse proxy
- Spring Boot backend running as a systemd service
- Azure Blob Storage for uploaded attachments
- System-assigned Managed Identity for secure storage access

### Azure Blob Storage Configuration

The Azure deployment uses the `azure` Spring profile.

The following environment variables are configured on the VM:

```bash
SPRING_PROFILES_ACTIVE=prod,azure
AZURE_STORAGE_ACCOUNT_NAME=codomaxmodule03storage
AZURE_STORAGE_CONTAINER_NAME=app-uploads
```

The VM's system-assigned Managed Identity has the **Storage Blob Data Contributor** role on the storage account.

The application uses Azure Default Credential authentication rather than storing storage account keys in source code.

The Blob Storage container is private.

### Backend Service

The Spring Boot backend runs as a Linux systemd service named:

`cloud-task-manager`

Useful commands on the VM:

Check service status:

```bash
sudo systemctl status cloud-task-manager
```

Restart the backend:

```bash
sudo systemctl restart cloud-task-manager
```

View backend logs:

```bash
sudo journalctl -u cloud-task-manager -n 50 --no-pager
```

### Nginx Configuration

Nginx serves the frontend production build from:

`/opt/cloud-task-manager`

It also forwards API requests to the backend running on:

`127.0.0.1:8080`

A sample configuration is available in:

`deployment/nginx-cloud-task-manager.conf`

## Build for Production

### Build the Frontend

From the `frontend` directory:

```bash
npm install
npm run build
```

The production files are generated in:

`frontend/dist/`

### Build the Backend

From the `backend` directory:

```bash
mvn clean package
```

The executable JAR is generated in:

`backend/target/`

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Retrieve all tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/{id}` | Retrieve a task |
| PUT | `/api/tasks/{id}` | Update a task |
| PATCH | `/api/tasks/{id}/complete` | Mark a task as completed |
| DELETE | `/api/tasks/{id}` | Delete a task |
| POST | `/api/tasks/{id}/attachment` | Upload a task attachment |

For attachment uploads, use the multipart form field `file`.

## Security and Deployment Notes

- Azure Blob Storage access uses Managed Identity.
- Storage account keys and passwords must not be committed to GitHub.
- The Blob Storage container is private.
- The H2 database is stored on the Azure VM; it is not an Azure managed database.
- The current deployment uses HTTP and does not include application-level user authentication.
- Authentication, authorization, HTTPS, database backups, and production monitoring should be added before real-world production use.

## GitHub Repository

Source code:

https://github.com/Darani-Wickramasinghe/cloud-task-manager

## Project Status

The application has been built, tested locally, deployed to an Azure Linux VM, and integrated with Azure Blob Storage using Managed Identity.