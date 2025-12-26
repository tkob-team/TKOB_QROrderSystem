export interface StorageService {
  upload(
    file: Buffer, // Domain-level - Không dính vào fs (filesystem)
    options: {
      key: string; // object identifier (ko phải là path local)
      contentType: string;
    },
  ): Promise<string>; // return public url (CDN URL)

  delete(key: string): Promise<void>;
}
