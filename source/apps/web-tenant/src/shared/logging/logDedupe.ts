import type { MutableRefObject } from 'react';

export function shouldLogBySignature(ref: MutableRefObject<string>, signature: string): boolean {
  if (ref.current === signature) {
    return false;
  }

  ref.current = signature;
  return true;
}
