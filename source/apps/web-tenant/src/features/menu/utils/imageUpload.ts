export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.name}. Only JPG, PNG, and WebP are allowed.` };
  }

  // Check extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return { valid: false, error: `Invalid extension: ${file.name}. Only .jpg, .jpeg, .png, and .webp are allowed.` };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File too large: ${file.name}. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
  }

  return { valid: true };
};
