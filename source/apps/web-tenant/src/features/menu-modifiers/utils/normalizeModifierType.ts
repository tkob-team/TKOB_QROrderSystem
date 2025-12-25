export function normalizeModifierType(type: string): 'single' | 'multiple' {
  return type === 'SINGLE_CHOICE' || type === 'single' ? 'single' : 'multiple';
}
