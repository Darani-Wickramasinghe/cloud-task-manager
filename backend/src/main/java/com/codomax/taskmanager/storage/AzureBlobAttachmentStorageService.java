package com.codomax.taskmanager.storage;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.BlobHttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Profile("azure")
public class AzureBlobAttachmentStorageService implements AttachmentStorageService {
    private final BlobContainerClient containerClient;

    public AzureBlobAttachmentStorageService(
            @Value("${app.azure.storage-account-name}") String accountName,
            @Value("${app.azure.container-name:app-uploads}") String containerName) {
        String endpoint = "https://" + accountName + ".blob.core.windows.net";
        BlobServiceClient serviceClient = new BlobServiceClientBuilder()
                .endpoint(endpoint)
                .credential(new DefaultAzureCredentialBuilder().build())
                .buildClient();
        this.containerClient = serviceClient.getBlobContainerClient(containerName);
    }

    @Override
    public StoredAttachment store(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename();
            String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String blobName = UUID.randomUUID() + "-" + safeName;
            BlobClient blob = containerClient.getBlobClient(blobName);
            blob.upload(file.getInputStream(), file.getSize(), true);
            blob.setHttpHeaders(new BlobHttpHeaders().setContentType(
                    file.getContentType() == null ? "application/octet-stream" : file.getContentType()));
            return new StoredAttachment(original, blobName);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not upload attachment to Azure Blob Storage", ex);
        }
    }
}
