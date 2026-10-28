import {PDF_INPUT_LIMITS} from './document-input';
import {MINIMUM_PROMPT_VERSION, PROMPT_LANGUAGES} from './minimum-analysis-prompt';

// Public, read-only description of the fixed Minimum AI route. Offline Settings
// tests check the mirrored literals against the actual adapter; never import
// server credentials or provider helpers into the Settings client bundle.
export const minimumAiSettings = {
  model: 'gemini-3.5-flash-lite',
  promptVersion: MINIMUM_PROMPT_VERSION,
  languages: PROMPT_LANGUAGES,
  limits: PDF_INPUT_LIMITS,
  maxOutputTokens: 8192,
  timeoutSeconds: 90,
} as const;
