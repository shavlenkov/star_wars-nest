import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Image } from "./entities/images.entity";
import { People } from "../swapi/people/entities/people.entity";

import * as AWS from "aws-sdk";

import { config } from "dotenv";

config()

@Injectable()
export class ImagesService {

    private s3: AWS.S3;

    constructor(
        @InjectRepository(Image)
        private readonly imagesRepository: Repository<Image>,
        @InjectRepository(People)
        private readonly peopleRepository: Repository<People>,
    ) {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    async addImages(newPeople, files: Array<Express.Multer.File>) {
        const imagesUrls = await this.uploadToAWS(files)

        const savedImageRecords = await this.saveRecordsToDB(imagesUrls)

        newPeople.images = savedImageRecords;

        await this.peopleRepository.save(newPeople)


    }

    private async uploadToAWS(files: Array<Express.Multer.File>) {
        const promises = files.map(async (file) => {
            this.s3.upload({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: file.originalname,
                Body: file.buffer,
            }).promise()
        })
        
        await Promise.all(promises);
        
        return promises.map(file => file['url'])
    }
    
    private async saveRecordsToDB(imagesUrls: string[]) {
        const imagesRecords: Promise<Image>[] = imagesUrls.map(async (url: string) =>  this.imagesRepository.create({url}))
        
        await Promise.all(imagesRecords)
        
        const savedImagesRecord = [];

        for await (const image of imagesRecords) {
            savedImagesRecord.push(await this.imagesRepository.save(image))
        }

        return savedImagesRecord;
    }

    async deleteImages(urls) {
        urls.forEach(async (item) => {

            let url = decodeURIComponent(item.url)

            const key = url.split('/').pop(); // get the key (filename) from the URL
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
            };
            await this.s3.deleteObject(params).promise();

        })
    }

}
