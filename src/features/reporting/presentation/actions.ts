'use me server';
// Note: 'use server' directive for Next.js Server Actions
'use server';

import { SubmitReportUseCase } from '@/features/reporting/application/SubmitReportUseCase';
import { citizenReportFormSchema } from '@/features/reporting/presentation/validationSchema';

export async function submitReportAction(prevState: unknown, formData: FormData) {
  const rawInput = {
    description: formData.get('description')?.toString() || '',
    citizenCategory: formData.get('citizenCategory')?.toString() || undefined,
    locationText: formData.get('locationText')?.toString() || '',
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')!.toString()) : undefined,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')!.toString()) : undefined,
    contactName: formData.get('contactName')?.toString() || undefined,
    contactEmail: formData.get('contactEmail')?.toString() || undefined,
    contactPhone: formData.get('contactPhone')?.toString() || undefined,
    evidenceUrl: formData.get('evidenceUrl')?.toString() || undefined,
    consentToContact: formData.get('consentToContact') === 'on' || formData.get('consentToContact') === 'true',
  };

  const validationResult = citizenReportFormSchema.safeParse(rawInput);
  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {};
    validationResult.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0].toString()] = issue.message;
      }
    });
    return {
      success: false as const,
      error: 'Validation failed. Please correct the highlighted fields.',
      fieldErrors,
    };
  }

  const useCase = new SubmitReportUseCase();
  const result = await useCase.execute(validationResult.data);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error.message,
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}

import { uploadImageToCloudinary } from '@/features/reporting/infrastructure/cloudinary.service';

export async function uploadReportImageAction(formData: FormData) {
  try {
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      const base64Data = formData.get('base64')?.toString();
      if (base64Data) {
        const result = await uploadImageToCloudinary(base64Data);
        return {
          success: true as const,
          url: result.url,
          publicId: result.publicId,
        };
      }
      return { success: false as const, error: 'No image file provided.' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false as const, error: 'Image size must be less than 10MB.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadImageToCloudinary(arrayBuffer, file.name);

    return {
      success: true as const,
      url: result.url,
      publicId: result.publicId,
    };
  } catch (err: any) {
    console.error('Cloudinary upload action error:', err);
    return {
      success: false as const,
      error: err?.message || 'Failed to upload image to Cloudinary.',
    };
  }
}

