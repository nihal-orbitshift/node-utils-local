import { IContext } from '../../context/index.js';

export interface UploadJsonParams {
  bucket: string;
  context: IContext;
  key: string;
  data: object;
  s3ClientConfig?: {
    S3_ACCESS_KEY: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
  };
}

export interface GetObjectsParams {
  bucket: string;
  keys: string[];
  s3ClientConfig?: {
    S3_ACCESS_KEY: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
  };
}

export interface GetObjectParams {
  bucket: string;
  key: string;
  s3ClientConfig?: {
    S3_ACCESS_KEY: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
  };
}

export interface ListObjectParams {
  context: IContext;
  bucketName: string;
  s3ClientConfig: {
    S3_ACCESS_KEY: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
  };
  folderName: string;
  fileFilters: {
    allowedExtensions: string[];
  };
}

export interface UploadFileJsonParams {
  context: IContext,
  bucket: string;
  key: string;
  bodyAsString: string;
  s3ClientConfig?: {
    S3_ACCESS_KEY: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
  }
}