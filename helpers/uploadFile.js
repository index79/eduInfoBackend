const AWS = require("aws-sdk");
const sharp = require("sharp");

const AWS_ACCESS_KEY_ID = "AKIAZZGXKU7TJECSOSFH";
const AWS_SECRET_ACCESS_KEY = "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";
const AWS_REGION = "ap-northeast-2";

const sharpify = async (originalFile) => {
  try {
    const image = sharp(originalFile.buffer);
    const meta = await image.metadata();
    const { format } = meta;
    const config = {
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      png: { quality: 80 },
    };
    const newFile = await image[format](config[format]).resize({
      width: 800,
      withoutEnlargement: true,
    });
    return newFile;
  } catch (err) {
    throw new Error(err);
  }
};

const uploadToAWS = (props) => {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });
    s3.upload(props, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

module.exports = { sharpify, uploadToAWS };
