import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseValue(rawValue: string) {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function loadEnv() {
  const candidatePaths = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'api/.env'),
  ];

  for (const filePath of candidatePaths) {
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = parseValue(trimmed.slice(separatorIndex + 1));

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }

    return;
  }
}
