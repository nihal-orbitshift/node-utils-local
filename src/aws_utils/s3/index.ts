import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import _ from 'lodash';
// @ts-ignore
import { _Object } from '@aws-sdk/client-s3/dist-types/models/models_0';
import {
  GetObjectParams,
  GetObjectsParams,
  ListObjectParams,
  UploadJsonParams,
  UploadFileJsonParams
} from './types.js';
import { IContext } from '../../index.js';

let s3Client = new S3Client({ region: 'us-east-1' });

export const getObjectAsString = async ({
  bucket,
  key,
  s3ClientConfig
}: GetObjectParams) => {
  if (!_.isEmpty(s3ClientConfig)) {
    s3Client = new S3Client({
      credentials: {
        accessKeyId: s3ClientConfig.S3_ACCESS_KEY,
        secretAccessKey: s3ClientConfig.S3_SECRET_ACCESS_KEY
      },
      region: s3ClientConfig.S3_REGION
    });
  }
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const { Body } = (await s3Client.send(command)) as {
    Body: { on: (arg0: string, arg1: { (chunk: any): void }) => void };
  };
  return streamToString(Body);
};

function streamToString(stream: {
  on: (arg0: string, arg1: { (chunk: any): void }) => void;
}) {
  return new Promise((resolve, reject) => {
    const chunks = [] as Uint8Array[];
    stream?.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}

export const getObjects = async ({
  bucket,
  keys,
  s3ClientConfig
}: GetObjectsParams) => {
  const result = await Promise.all(
    keys.map(async (key) => {
      const data = await getObjectAsString({ bucket, key, s3ClientConfig });
      return { [key]: data };
    })
  );

  return result.reduce((acc, obj) => {
    return { ...acc, ...obj };
  }, {});
};

export const listS3ObjectsWithinFolder = async ({
  context,
  bucketName,
  s3ClientConfig,
  folderName,
  fileFilters
}: ListObjectParams): Promise<_Object[]> => {
  if (!_.isEmpty(s3ClientConfig)) {
    s3Client = new S3Client({
      credentials: {
        accessKeyId: s3ClientConfig.S3_ACCESS_KEY,
        secretAccessKey: s3ClientConfig.S3_SECRET_ACCESS_KEY
      },
      region: s3ClientConfig.S3_REGION
    });
  }
  let isTruncated = true;
  let continuationToken: string | undefined;
  let allObjects: _Object[] = [];

  while (isTruncated) {
    const params = {
      Bucket: bucketName,
      Prefix: folderName,
      ContinuationToken: continuationToken
    };

    try {
      const command = new ListObjectsV2Command(params);
      const response = await s3Client.send(command);

      if (response.Contents) {
        let filteredObjects = response.Contents || [];
        if (!_.isEmpty(fileFilters.allowedExtensions)) {
          filteredObjects =
            filteredObjects.filter((obj: _Object) => {
              const extension: string = obj.Key?.split('.').pop().toLowerCase();
              return fileFilters.allowedExtensions.includes(extension);
            }) || [];
        }
        allObjects.push(...filteredObjects);
      }

      isTruncated = !!response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    } catch (error) {
      context.logger.error(`Error listing S3 objects: ${error}`);
      throw error;
    }
  }

  context.logger.error(
    `Fetched a total of: ${allObjects.length} from S3 for folder: ${folderName}`
  );
  return allObjects;
};

export const uploadJsonToS3 = async ({
  context,
  bucket,
  key,
  data,
  s3ClientConfig
}: UploadJsonParams) => {
  if (!_.isEmpty(s3ClientConfig)) {
    s3Client = new S3Client({
      region: s3ClientConfig.S3_REGION,
      credentials: {
        accessKeyId: s3ClientConfig.S3_ACCESS_KEY,
        secretAccessKey: s3ClientConfig.S3_SECRET_ACCESS_KEY
      }
    });
  }
  const body = JSON.stringify(data);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json'
  });

  try {
    const response = await s3Client.send(command);
    context.logger.debug(`Successfully uploaded JSON to S3: ${key}`);
    return response;
  } catch (error) {
    context.logger.error('Error uploading JSON to S3:', error);
    throw error;
  }
};

export const uploadSingleFile = async ({
  context,
  bucket,
  key,
  bodyAsString,
  s3ClientConfig
}: UploadFileJsonParams) => {
  try {
    if (s3ClientConfig) {
      s3Client = new S3Client({
        credentials: {
          accessKeyId: s3ClientConfig.S3_ACCESS_KEY,
          secretAccessKey: s3ClientConfig.S3_SECRET_ACCESS_KEY
        },
        region: s3ClientConfig.S3_REGION
      });
    }

    const params = {
      Bucket: bucket,
      Key: key,
      Body: bodyAsString
    };

    const result = await s3Client.send(new PutObjectCommand(params));
    context.logger.debug('Upload successful:', result);
  } catch (error) {
    context.logger.error('Upload failed:', error);
  }
};
