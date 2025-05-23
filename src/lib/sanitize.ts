export function sanitizeInput(input: string): string {
  // Remove characters that could be used for XSS or injection
  return input.replace(/[<>"'`]/g, '');
} 