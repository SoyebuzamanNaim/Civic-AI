import crypto from 'node:crypto';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export async function uploadImageToCloudinary(
  fileInput: Buffer | ArrayBuffer | string,
  fileName: string = 'evidence.jpg'
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'e3yv0you';
  const apiKey = process.env.CLOUDINARY_API_KEY || '849338875222673';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'jkJSj-uAgEqC0Gqej62QOhVOjjI';

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing in environment.');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Cloudinary signature format: parameters sorted alphabetically + apiSecret
  const stringToSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  
  if (typeof fileInput === 'string') {
    formData.append('file', fileInput);
  } else {
    const uint8Array = new Uint8Array(fileInput);
    const blob = new Blob([uint8Array as unknown as BlobPart]);
    formData.append('file', blob, fileName);
  }

  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed [${response.status}]: ${errorText}`);
  }

  const data = (await response.json()) as { secure_url: string; public_id: string };

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}
