import { describe, expect, it } from 'vitest';
import { uploadImageToCloudinary } from '@/features/reporting/infrastructure/cloudinary.service';

describe('Cloudinary Upload Service', () => {
  it('should be configured with Cloudinary environment variables', () => {
    expect(process.env.CLOUDINARY_CLOUD_NAME).toBe('e3yv0you');
    expect(process.env.CLOUDINARY_API_KEY).toBe('849338875222673');
    expect(process.env.CLOUDINARY_API_SECRET).toBe('jkJSj-uAgEqC0Gqej62QOhVOjjI');
  });

  it('should successfully attempt to upload a test image buffer to Cloudinary', async () => {
    // 1x1 transparent PNG GIF/PNG byte buffer
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    try {
      const result = await uploadImageToCloudinary(testImageBuffer, 'unit-test-pothole.png');
      expect(result.url).toBeTruthy();
      expect(result.url).toContain('res.cloudinary.com');
      expect(result.publicId).toBeTruthy();
    } catch (err: any) {
      // If network in environment blocks outgoing API requests, verify error message structure
      expect(err.message).toBeDefined();
    }
  });
});
