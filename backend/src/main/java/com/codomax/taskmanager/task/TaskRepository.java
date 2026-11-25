package com.codomax.taskmanager.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Optional<Task> findByIdAndOwnerId(Long id, UUID ownerId);
}
