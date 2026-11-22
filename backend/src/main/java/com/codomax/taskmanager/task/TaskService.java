package com.codomax.taskmanager.task;

import com.codomax.taskmanager.storage.AttachmentStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class TaskService {
    private final TaskRepository repository;
    private final AttachmentStorageService attachmentStorage;

    public TaskService(TaskRepository repository, AttachmentStorageService attachmentStorage) {
        this.repository = repository;
        this.attachmentStorage = attachmentStorage;
    }

    @Transactional(readOnly = true)
    public List<Task> findAll() {
        return repository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    @Transactional(readOnly = true)
    public Task findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    public Task create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return repository.save(task);
    }

    public Task update(Long id, TaskRequest request) {
        Task task = findById(id);
        apply(task, request);
        return repository.save(task);
    }

    public Task complete(Long id) {
        Task task = findById(id);
        task.setStatus(TaskStatus.COMPLETED);
        return repository.save(task);
    }

    public void delete(Long id) {
        repository.delete(findById(id));
    }

    public Task attach(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Please select a non-empty file");
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("Maximum attachment size is 10 MB");
        Task task = findById(id);
        AttachmentStorageService.StoredAttachment stored = attachmentStorage.store(file);
        task.setAttachmentName(stored.originalName());
        task.setAttachmentBlobName(stored.storageName());
        return repository.save(task);
    }

    private void apply(Task task, TaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status() == null ? TaskStatus.TODO : request.status());
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setDueDate(request.dueDate());
    }
}
