# Deployment notes

This file is a deployment checklist. Follow the guided steps in ChatGPT before changing the live VM.

1. Build the React frontend on Windows using `npm install` and `npm run build`.
2. Build the Spring Boot backend on Windows using `mvn clean package`.
3. Copy the frontend `dist` files and backend JAR to the VM.
4. Configure the backend service with `SPRING_PROFILES_ACTIVE=prod,azure`.
5. Keep the backend listening on localhost port 8080; expose the website through Nginx on port 80.
6. Configure Nginx using `nginx-cloud-task-manager.conf`.
7. Confirm the VM's managed identity has `Storage Blob Data Contributor` on the storage account.
8. Test `/api/health`, create a task, and upload a small attachment.

Security reminders:
- Do not expose port 8080 publicly.
- Do not make the Blob container public.
- Do not store storage keys or access tokens in files or Git.
- Add HTTPS and authentication before real public use.
- H2 is a demo database; use a managed database for production after reviewing cost.
