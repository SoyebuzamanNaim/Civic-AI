import { FallbackReportAnalysisProvider } from '@/features/ai-analysis/infrastructure/providers/fallback-report-analysis.provider';
import { describe, expect, it } from 'vitest';

describe('AI Banglish Language Comprehension Tests', () => {
  const fallbackProvider = new FallbackReportAnalysisProvider();

  it('should categorize Banglish pothole report to POTHOLE', async () => {
    const result = await fallbackProvider.analyzeReport({
      description: 'Rastay boro gorto hoye ache, khana khondo gari cholte pare na.',
      locationText: 'Dhanmondi 32',
    });

    expect(result.category).toBe('POTHOLE');
  });

  it('should categorize Banglish streetlight report to BROKEN_STREETLIGHT', async () => {
    const result = await fallbackProvider.analyzeReport({
      description: 'Rastar bati nosto hoye ache, raste purai andhokar.',
      locationText: 'Gulshan 2',
    });

    expect(result.category).toBe('BROKEN_STREETLIGHT');
  });

  it('should categorize Banglish water leak report to WATER_LEAK', async () => {
    const result = await fallbackProvider.analyzeReport({
      description: 'Main panir pipe bhanga, pani leak hocche rasta bhese jacche.',
      locationText: 'Uttara Sector 7',
    });

    expect(result.category).toBe('WATER_LEAK');
  });

  it('should categorize Banglish illegal dumping report to ILLEGAL_DUMPING', async () => {
    const result = await fallbackProvider.analyzeReport({
      description: 'Khola jaygay onek moyla felese, gondho asche.',
      locationText: 'Mirpur 10',
    });

    expect(result.category).toBe('ILLEGAL_DUMPING');
  });
});
