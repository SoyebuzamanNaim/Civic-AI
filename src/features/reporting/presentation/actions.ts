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
