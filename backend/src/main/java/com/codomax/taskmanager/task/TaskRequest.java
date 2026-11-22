package com.codomax.taskmanager.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title must be 120 characters or fewer")
        String title,
        @Size(max = 1000, message = "Description must be 1000 characters or fewer")
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate
) {}
