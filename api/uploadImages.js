const { randomUUID } = require('crypto');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET = process.env.S3_BUCKET_NAME;

async function uploadImage(base64) {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image data');
  }
  const contentType = matches[1];
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif'];
  if (!allowed.includes(contentType)) {
    throw new Error('Unsupported image format');
  }
  const data = Buffer.from(matches[2], 'base64');
  const key = `${randomUUID()}`;
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: data,
    ContentType: contentType,
    // ACL: 'public-read', // <-- REMOVED
  };
  await s3.putObject(params).promise();
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (!body || typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { images } = body;
  if (!images) {
    return res.status(400).json({ error: 'images is required' });
  }

  const imageArray = Array.isArray(images) ? images : [images];
  let urls = [];
  try {
    urls = await Promise.all(imageArray.map(uploadImage));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  res.status(200).json({ urls });
};
