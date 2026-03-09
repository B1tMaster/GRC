import { Client } from 'minio'

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'strong-password-here',
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'default-bucket'

export const MinioService = {
  uploadFile: async (fileName: string, fileBuffer: Buffer): Promise<string> => {
    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer)
    return fileName
  },

  getFile: async (fileName: string): Promise<Buffer> => {
    const dataStream = await minioClient.getObject(BUCKET_NAME, fileName)

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      dataStream.on('data', chunk => chunks.push(chunk))
      dataStream.on('end', () => resolve(Buffer.concat(chunks)))
      dataStream.on('error', reject)
    })
  },

  listFiles: async (prefix: string = ''): Promise<string[]> => {
    const files: string[] = []
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)

    return new Promise((resolve, reject) => {
      stream.on('data', obj => {
        if (obj.name) files.push(obj.name)
      })
      stream.on('end', () => resolve(files))
      stream.on('error', reject)
    })
  },

  deleteFile: async (fileName: string): Promise<void> => {
    await minioClient.removeObject(BUCKET_NAME, fileName)
  },

  ensureBucket: async (): Promise<void> => {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME)
    }
  },
}
