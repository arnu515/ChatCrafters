import { S3Client, PutObjectCommand, type ObjectCannedACL, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { env } from "$env/dynamic/private"

export const s3 = new S3Client({
	region: 'us-east-1',
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: false,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY
	}
})

export function putFile(Key: string, ACL: ObjectCannedACL, body: ArrayBuffer) {
	return s3.send(new PutObjectCommand({
		Key,
		ACL,
		Body: new Uint8Array(body),
		Bucket: env.S3_BUCKET,
	})
	)
}

export function deleteFile(Key: string) {
	return s3.send(new DeleteObjectCommand({
		Bucket: env.S3_BUCKET,
		Key
	}))
}

