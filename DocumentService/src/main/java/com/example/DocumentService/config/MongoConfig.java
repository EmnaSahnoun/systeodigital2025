package com.example.DocumentService.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

//configuration des composants MongoDB pour gérer le stockage de fichiers via GridFS.
@Configuration
// pour trouver les interfaces de repository (ici: com.example.DocumentService.repositories)
@EnableMongoRepositories(basePackages = "com.example.DocumentService.repositories")
public class MongoConfig  {
    @Bean
    public GridFSBucket gridFSBucket(MongoClient mongoClient) {
        // créer une instance de GridFSBucket
        return GridFSBuckets.create(mongoClient.getDatabase("mediafile"));
    }

    @Bean
    public GridFsTemplate gridFsTemplate(MongoDatabaseFactory mongoDatabaseFactory,
                                         MappingMongoConverter mongoConverter) {
        return new GridFsTemplate(mongoDatabaseFactory, mongoConverter);
    }

    @Bean
    public GridFsOperations gridFsOperations(MongoDatabaseFactory mongoDatabaseFactory,
                                             MappingMongoConverter mongoConverter) {
        return new GridFsTemplate(mongoDatabaseFactory, mongoConverter);
    }
}