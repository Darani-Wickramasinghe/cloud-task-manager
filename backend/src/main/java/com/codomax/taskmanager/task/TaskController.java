package com.codomax.taskmanager.task;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {
    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("UP", "Cloud Task Manager API");
    }

    @GetMapping("/tasks")
    public List<Task> all() {
        return service.findAll();
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@Valid @RequestBody TaskRequest request) {
        return service.create(request);
    }

    @GetMapping("/tasks/{id}")
    public Task one(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/tasks/{id}")
    public Task update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/tasks/{id}/complete")
    public Task complete(@PathVariable Long id) {
        return service.complete(id);
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/tasks/{id}/attachment")
    public Task upload(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.attach(id, file);
    }

    public record HealthResponse(String status, String service) {}
}
