import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      const val = valParts.join('=').trim();
      const k = key.trim();
      process.env[k] = val;
    }
  });
}
