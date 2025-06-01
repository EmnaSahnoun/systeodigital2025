package com.example.DocumentService.service;

import com.example.DocumentService.dto.request.MediaFileRequest;
import com.example.DocumentService.model.MediaFile;
import com.example.DocumentService.publisher.FileEventProducer;
import com.example.DocumentService.repositories.MediaFileRepository;
import com.mongodb.BasicDBObject;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.List;

@Service
public class MediaFileService {
    private final MediaFileRepository mediaFileRepository;
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;
    private final FileEventProducer eventProducer;

    public MediaFileService(MediaFileRepository mediaFileRepository,
                            GridFsTemplate gridFsTemplate,
                            GridFsOperations gridFsOperations,
                            FileEventProducer eventProducer

                            ) {
        this.mediaFileRepository = mediaFileRepository;
        this.gridFsTemplate = gridFsTemplate;
        this.gridFsOperations = gridFsOperations;
        this.eventProducer = eventProducer;

    }

    public MediaFile uploadFile(MediaFileRequest request,String authToken) throws IOException {
        MultipartFile file = request.getFile();

        // Définir les métadonnées
        BasicDBObject metaData = new BasicDBObject();
        metaData.put("taskId", request.getTaskId());
        metaData.put("projectId", request.getProjectId());
        metaData.put("phaseId", request.getPhaseId());
        metaData.put("uploadedBy", request.getUploadedBy());

        // Stocker le fichier dans GridFS
        ObjectId fileId = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType(),
                metaData
        );

        // Créer et sauvegarder l'entité MediaFile
        MediaFile mediaFile = new MediaFile();
        mediaFile.setTaskId(request.getTaskId());
        mediaFile.setProjectId(request.getProjectId());
        mediaFile.setPhaseId(request.getPhaseId());
        mediaFile.setFilename(file.getOriginalFilename());
        mediaFile.setDescription(request.getDescription());
        mediaFile.setMediaType(determineMediaType(file.getContentType()));
        mediaFile.setContentType(file.getContentType());
        mediaFile.setSize(file.getSize());
        mediaFile.setUploadedBy(request.getUploadedBy());
        mediaFile.setUploadDate(new Date());
        mediaFile.setGridFsId(fileId.toString());
        mediaFile.setAction("CREATE");
        MediaFile savedMediaFile = mediaFileRepository.save(mediaFile);
        eventProducer.sendFileinMessage(savedMediaFile,authToken);
        return savedMediaFile;
    }

    public InputStream downloadFile(String id) throws IOException {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(mediaFile.getGridFsId())));

        if (file == null) {
            throw new RuntimeException("File not found in GridFS with id: " + mediaFile.getGridFsId());
        }

        return gridFsOperations.getResource(file).getInputStream();
    }
    public List<MediaFile> getFilesByTask(String taskId) {
        return mediaFileRepository.findByTaskId(taskId);
    }


 public MediaFile getMediaFileById(String id) {
        return mediaFileRepository.findById(id).orElse(null);
 }
    public void deleteFile(String id,String authToken) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        gridFsTemplate.delete(new Query(Criteria.where("_id").is(mediaFile.getGridFsId())));
        mediaFile.setAction("DELETE");
        eventProducer.sendFileinMessage(mediaFile,authToken);
        mediaFileRepository.delete(mediaFile);
    }

    private String determineMediaType(String contentType) {
        if (contentType == null) {
            return "DOCUMENT";
        }

        if (contentType.startsWith("image/")) {
            return "IMAGE";
        } else if (contentType.startsWith("video/")) {
            return "VIDEO";
        } else {
            return "DOCUMENT";
        }
    }
}
