package com.codomax.taskmanager.storage;

import org.springframework.web.multipart.MultipartFile;

public interface AttachmentStorageService {
    StoredAttachment store(MultipartFile file);
    record StoredAttachment(String originalName, String storageName) {}
}
