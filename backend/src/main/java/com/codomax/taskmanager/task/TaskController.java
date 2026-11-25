package com.codomax.taskmanager.task;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    private UUID getOwnerId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("UP", "Cloud Task Manager API");
    }

    @GetMapping("/tasks")
    public List<Task> all(@AuthenticationPrincipal Jwt jwt) {
        return service.findAll(getOwnerId(jwt));
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.create(request, getOwnerId(jwt));
    }

    @GetMapping("/tasks/{id}")
    public Task one(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.findById(id, getOwnerId(jwt));
    }

    @PutMapping("/tasks/{id}")
    public Task update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.update(id, request, getOwnerId(jwt));
    }

    @PatchMapping("/tasks/{id}/complete")
    public Task complete(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.complete(id, getOwnerId(jwt));
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        service.delete(id, getOwnerId(jwt));
    }

    @PostMapping("/tasks/{id}/attachment")
    public Task upload(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.attach(id, file, getOwnerId(jwt));
    }

    public record HealthResponse(String status, String service) {}
}
