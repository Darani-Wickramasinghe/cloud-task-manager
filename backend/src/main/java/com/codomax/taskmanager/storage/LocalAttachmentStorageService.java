package com.codomax.taskmanager.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Profile("!azure")
public class LocalAttachmentStorageService implements AttachmentStorageService {
    private final Path uploadDirectory;

    public LocalAttachmentStorageService(@Value("${app.storage.local-directory:uploads}") String directory) {
        this.uploadDirectory = Paths.get(directory).toAbsolutePath().normalize();
    }

    @Override
    public StoredAttachment store(MultipartFile file) {
        try {
            Files.createDirectories(uploadDirectory);
            String original = file.getOriginalFilename() == null ? "attachment" : Path.of(file.getOriginalFilename()).getFileName().toString();
            String stored = UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path destination = uploadDirectory.resolve(stored).normalize();
            if (!destination.startsWith(uploadDirectory)) throw new IllegalArgumentException("Invalid filename");
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return new StoredAttachment(original, stored);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store attachment", ex);
        }
    }
}
