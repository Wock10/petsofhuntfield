const { randomUUID } = require('crypto');
const AWS = require('aws-sdk');
const { Pool } = require('pg');

// Configure AWS and Postgres from environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

const BUCKET = process.env.S3_BUCKET_NAME;

async function uploadImage(base64) {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  const contentType = matches ? matches[1] : 'application/octet-stream';
  const data = Buffer.from(matches ? matches[2] : base64, 'base64');
  const key = `${randomUUID()}`;
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: data,
    ContentType: contentType,
    ACL: 'public-read',
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
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { name, type, images = [], address = '', contact = '' } = body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const imageArray = Array.isArray(images) ? images : [images];
  let uploadedUrls = [];
  try {
    uploadedUrls = await Promise.all(imageArray.map(uploadImage));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload images' });
  }

  const petId = randomUUID();
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO public.pets (id, name, type, images, address, contact) VALUES ($1,$2,$3,$4,$5,$6)',
      [petId, name, type, uploadedUrls, address, contact]
    );
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }

  const pet = { id: petId, name, type, images: uploadedUrls, address, contact };
  res.status(201).json(pet);
};

