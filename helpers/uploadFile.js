const AWS = require("aws-sdk");
const sharp = require("sharp");
require("dotenv").config();

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
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });
    s3.upload(props, (err, data) => {
      if (err) console.log(err.message);
      resolve(data);
    });
  });
};

module.exports = { sharpify, uploadToAWS };
