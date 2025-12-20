// Mock utilities for simulating API behavior

/**
 * Simulate network delay
 */
export const delay = (ms: number = 500): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Randomly throw error to simulate network issues
 */
export const randomError = (probability: number = 0.1): void => {
  if (Math.random() < probability) {
    throw new Error('Simulated network error');
  }
};

/**
 * Simulate successful response
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    message,
  };
}

/**
 * Simulate error response
 */
export function createErrorResponse<T = never>(message: string) {
  return {
    success: false as const,
    data: null as T,
    message,
  };
}
