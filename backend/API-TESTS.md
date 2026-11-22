# API smoke tests

Start the backend, then use PowerShell:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Create a task:

```powershell
$body = @{
  title = "Explore Azure Blob Storage"
  description = "Test managed identity upload"
  status = "TODO"
  priority = "HIGH"
  dueDate = "2026-12-01"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/tasks -ContentType "application/json" -Body $body
```

List tasks:

```powershell
Invoke-RestMethod http://localhost:8080/api/tasks
```
