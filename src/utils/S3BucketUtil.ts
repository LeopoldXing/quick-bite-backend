import AWS from 'aws-sdk';
import { calculateMD5 } from "./GlobalUtils";
import { v4 as uuidv4 } from "uuid";

require('dotenv').config();
const accessKeyId = process.env.VITE_AWS_ACCESSKEY_ID as string;
const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESSKEY as string;
const s3BucketName = process.env.VITE_S3_BUCKET_NAME as string;
const s3Region = process.env.VITE_S3_REGION as string;

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

const myBucket = new AWS.S3({
  region: s3Region,
});

type UploadFileProps = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  onProgressUpdate: (progress: number) => void;
};

const keyPathConstructor = (filename: string) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.toLocaleString('en-US', { month: 'short' });
  const day = currentDate.getDate();

  const uuid = uuidv4();
  const newFileName = `${uuid}${filename.substring(filename.lastIndexOf('.'))}`;
  return `files/${year}/${month}/${day}/${newFileName}`;
};

const uploadFile = async ({ buffer, filename, mimetype, onProgressUpdate }: UploadFileProps): Promise<string> => {
  const keyPath = keyPathConstructor(filename);
  const md5Base64 = calculateMD5(buffer);

  const params = {
    Body: buffer,
    Bucket: s3BucketName,
    Key: keyPath,
    ContentMD5: md5Base64,
    ContentType: mimetype
  };

  myBucket.putObject(params)
      .on('httpUploadProgress', (evt) => {
        onProgressUpdate(Math.round((evt.loaded / evt.total) * 100));
      })
      .send((err) => {
        if (err) console.log(err);
      });

  return `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/${keyPath}`;
};

export { uploadFile };
