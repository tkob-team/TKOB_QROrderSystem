import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  IPaymentProvider,
  PaymentIntent,
  PaymentStatusResult,
  PaymentProviderException,
  PaymentProviderNetworkException,
  PaymentProviderRateLimitException,
  PaymentProviderInvalidRequestException,
} from '../interfaces/payment-provider.interface';

/**
 * SePay Payment Provider Implementation
 *
 * Integrates with SePay VietQR API for bank transfer payments.
 * Docs: https://docs.sepay.vn
 * 
 * Supports two modes:
 * 1. Platform config (from .env): For tenant subscription payments
 * 2. Tenant config (from TenantPaymentConfig): For customer order payments
 */

/**
 * Tenant-specific SePay config for customer payments
 */
export interface TenantSepayConfig {
  accountNumber: string;
  accountName?: string;
  bankCode: string;
  apiKey?: string;
}

/**
 * Transaction data returned from SePay polling API
 */
export interface SepayTransaction {
  /** Transaction ID from SePay */
  id: string;
  /** Transaction amount (positive for incoming) */
  amount: number;
  /** Bank account number receiving the payment */
  accountNumber: string;
  /** Transfer content/description */
  transferContent: string;
  /** Transaction timestamp */
  transactionTime: Date;
  /** Bank code */
  bankCode: string;
  /** Sender account number */
  senderAccountNumber?: string;
  /** Sender name */
  senderName?: string;
  /** Reference code from bank */
  referenceCode?: string;
}

@Injectable()
export class SepayProvider implements IPaymentProvider {
  private readonly logger = new Logger(SepayProvider.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiUrl: string;
  
  // Platform config (for tenant subscription payments)
  private readonly platformApiToken: string;
  private readonly platformAccountNumber: string;
  private readonly platformAccountName: string;
  private readonly platformBankCode: string;
  
  private readonly retryAttempts: number = 3;
  private readonly retryDelay: number = 1000; // ms

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('payment.sepay.apiUrl')!;
    this.platformApiToken = this.configService.get<string>('payment.sepay.secretKey')!;
    this.platformAccountNumber = this.configService.get<string>(
      'payment.sepay.accountNumber',
    )!;
    this.platformAccountName = this.configService.get<string>(
      'payment.sepay.accountName',
    )!;
    this.platformBankCode = this.configService.get<string>('payment.sepay.bankCode')!;

    // Validate required config (platform config optional if only using tenant configs)
    if (!this.platformApiToken) {
      this.logger.warn('Platform SePay config not set. Only tenant-specific payments will work.');
    }

    // Create axios instance with defaults
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000, // 10s timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `SePay API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`,
        );
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `SePay API Error: ${error.config.method?.toUpperCase()} ${error.config.url} - Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          );
        } else if (error.request) {
          this.logger.error(
            `SePay Network Error: No response received - ${error.message}`,
          );
        } else {
          this.logger.error(`SePay Request Error: ${error.message}`);
        }
        return Promise.reject(error);
      },
    );

    this.logger.log(
      `SePay Provider initialized - Platform Bank: ${this.platformBankCode || 'NOT_SET'}, Account: ${this.platformAccountNumber || 'NOT_SET'}`,
    );
  }

  /**
   * Create payment intent with SePay
   *
   * SePay uses bank transfer model - we generate transfer content and return bank details.
   * No API call needed for basic implementation, just return bank account info.
   *
   * @param orderId - Order identifier
   * @param amount - Payment amount in VND
   * @param currency - Currency code (VND)
   * @param metadata - Additional metadata
   * @param tenantConfig - Tenant-specific SePay config (for customer orders). If not provided, uses platform config.
   * @returns Payment intent with QR code and payment details
   */
  async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
    tenantConfig?: TenantSepayConfig,
  ): Promise<PaymentIntent> {
    // Determine which config to use: tenant (for customer orders) or platform (for subscriptions)
    const accountNumber = tenantConfig?.accountNumber || this.platformAccountNumber;
    const accountName = tenantConfig?.accountName || this.platformAccountName || 'Restaurant';
    const bankCode = tenantConfig?.bankCode || this.platformBankCode;
    const configSource = tenantConfig ? 'tenant' : 'platform';

    this.logger.log(
      `Creating payment intent for order ${orderId} - Amount: ${amount} ${currency} - Config: ${configSource} - Bank: ${bankCode}`,
    );

    if (!accountNumber || !bankCode) {
      throw new PaymentProviderInvalidRequestException(
        `Missing SePay config. AccountNumber: ${!!accountNumber}, BankCode: ${!!bankCode}`,
      );
    }

    try {
      // Generate transfer content (used to match payment)
      const transferContent = this.generateTransferContent(orderId);

      // Generate VietQR content (for QR code generation)
      // Format: bank_code|account_number|account_name|amount|transfer_content
      const qrContent = this.generateVietQRContentWithConfig(
        amount,
        transferContent,
        bankCode,
        accountNumber,
        accountName,
      );

      // Generate deep link for mobile banking apps
      const deepLink = this.generateDeepLinkWithConfig(amount, transferContent, bankCode, accountNumber);

      // Return payment intent (no API call needed for basic SePay)
      const paymentIntent: PaymentIntent = {
        paymentId: '', // Will be set by PaymentService
        orderId,
        amount,
        currency,
        qrContent,
        deepLink,
        transferContent,
        accountNumber,
        accountName,
        bankCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        providerData: {
          provider: 'sepay',
          version: '1.0',
          ...metadata,
        },
      };

      this.logger.log(
        `Payment intent created for order ${orderId} - Transfer: ${transferContent}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to create payment intent for order ${orderId}: ${error.message}`,
      );
      throw new PaymentProviderException(
        'Failed to create payment intent',
        'CREATE_INTENT_ERROR',
        500,
      );
    }
  }

  /**
   * Verify webhook signature from SePay
   *
   * SePay webhook authentication uses API Key in header:
   * Authorization: Bearer API_TOKEN
   *
   * @param payload - Raw webhook payload
   * @param signature - Signature from Authorization header
   * @param secret - Optional webhook secret (not used by SePay)
   * @returns true if signature is valid
   */
  verifyWebhookSignature(
    payload: any,
    signature: string,
    secret?: string,
  ): boolean {
    this.logger.debug('Verifying SePay webhook signature');

    try {
      // SePay webhook uses: Authorization: Bearer API_TOKEN (per docs)
      // Extract the API token from signature (format: "Bearer XXXXX")
      const expectedPrefix = 'Bearer ';
      if (!signature.startsWith(expectedPrefix)) {
        this.logger.warn(
          `Invalid signature format. Expected "Bearer XXX", got: ${signature}`,
        );
        return false;
      }

      const providedApiKey = signature.substring(expectedPrefix.length).trim();

      // Compare with our API token (platform token for webhook verification)
      const isValid = providedApiKey === this.platformApiToken;

      if (!isValid) {
        this.logger.warn('Webhook signature verification failed - Invalid API key');
      } else {
        this.logger.debug('Webhook signature verified successfully');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Webhook signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get payment status from SePay
   *
   * Note: SePay primarily uses webhook for notifications.
   * This method can be used for manual status polling if needed.
   *
   * @param transactionId - Provider's transaction ID
   * @returns Payment status result
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    this.logger.log(`Getting payment status from SePay: ${transactionId}`);

    try {
      // SePay doesn't have a dedicated status endpoint in basic plan
      // Status updates come via webhook
      // For now, we'll return a placeholder response
      throw new PaymentProviderException(
        'Status polling not available. Use webhook for payment updates.',
        'STATUS_NOT_AVAILABLE',
        501,
      );
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw error;
      }

      this.logger.error(
        `Failed to get payment status: ${error.message}`,
      );
      throw new PaymentProviderException(
        'Failed to get payment status',
        'STATUS_ERROR',
        500,
      );
    }
  }

  /**
   * Poll recent transactions from SePay API
   * 
   * SePay API: GET /transactions/list
   * Returns list of recent bank transactions for the configured account.
   * 
   * @param limit - Number of transactions to fetch (default 20, max 100)
   * @param apiKey - Optional API key (uses platform key if not provided)
   * @returns List of recent transactions
   */
  async pollTransactions(
    limit: number = 20,
    apiKey?: string,
  ): Promise<SepayTransaction[]> {
    this.logger.log(`Polling SePay transactions (limit: ${limit})`);

    const token = apiKey || this.platformApiToken;
    
    if (!token) {
      throw new PaymentProviderException(
        'SePay API token not configured',
        'CONFIG_ERROR',
        500,
      );
    }

    try {
      const response = await this.executeWithRetry(async () => {
        return this.httpClient.get('/transactions/list', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          params: {
            limit,
          },
        });
      });

      const data = response.data;

      // Validate response structure according to SePay docs
      if (!data || data.status !== 200) {
        this.logger.error(`Invalid SePay response: ${JSON.stringify(data)}`);
        throw new PaymentProviderException(
          'Invalid response from SePay API',
          'INVALID_RESPONSE',
          500,
        );
      }

      if (!data.transactions || !Array.isArray(data.transactions)) {
        this.logger.warn('SePay returned no transactions array');
        return [];
      }

      // DEBUG: Log raw response to understand SePay's actual data
      this.logger.debug(`SePay raw response: status=${data.status}, count=${data.transactions.length}`);
      if (data.transactions.length > 0) {
        this.logger.debug(`Sample transaction: ${JSON.stringify(data.transactions[0], null, 2)}`);
      }

      // Parse transactions according to SePay API docs format
      const transactions: SepayTransaction[] = data.transactions.map((tx: any) => {
        const parsed = {
          id: String(tx.id || ''),
          amount: parseFloat(tx.amount_in || '0') || 0, // amount_in for incoming money
          accountNumber: String(tx.account_number || ''),
          transferContent: String(tx.transaction_content || '').trim(), // Main field per docs
          transactionTime: new Date(tx.transaction_date || Date.now()),
          bankCode: String(tx.bank_brand_name || ''), // SePay uses bank_brand_name
          senderAccountNumber: String(tx.sub_account || ''),
          senderName: String(tx.sender_name || ''),
          referenceCode: String(tx.reference_number || ''),
        };
        
        // Debug log each transaction
        this.logger.debug(`Parsed TX ${parsed.id}: ${parsed.amount} VND - "${parsed.transferContent}"`);
        
        return parsed;
      });

      this.logger.log(`Fetched ${transactions.length} transactions from SePay`);
      return transactions;
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw error;
      }

      this.logger.error(`Failed to poll SePay transactions: ${error.message}`);
      throw new PaymentProviderException(
        'Failed to poll transactions from SePay',
        'POLL_ERROR',
        500,
      );
    }
  }

  /**
   * Find a specific transaction by transfer content
   * 
   * @param transferContent - The transfer content to search for (e.g., DH{orderId})
   * @param limit - Number of recent transactions to search
   * @param apiKey - Optional API key
   * @returns Matching transaction or null
   */
  async findTransactionByContent(
    transferContent: string,
    limit: number = 50,
    apiKey?: string,
  ): Promise<SepayTransaction | null> {
    this.logger.log(`🔍 Searching for transaction with content: "${transferContent}"`);

    const transactions = await this.pollTransactions(limit, apiKey);

    if (transactions.length === 0) {
      this.logger.warn('⚠️  No transactions returned from SePay API');
      return null;
    }

    this.logger.log(`📋 Checking ${transactions.length} transactions for match...`);

    // Normalize search content (remove spaces, dashes, lowercase)
    const normalizeContent = (text: string) => 
      text.toUpperCase().replace(/[\s\-_\.]/g, '');

    const searchContent = normalizeContent(transferContent);
    
    this.logger.debug(`🔤 Normalized search: "${transferContent}" -> "${searchContent}"`);
    this.logger.debug(`📝 Transaction contents: ${transactions.map(t => `"${t.transferContent}"`).slice(0, 5).join(', ')}`);

    // Try multiple matching strategies
    // 1. Exact match (case-insensitive)
    let matched = transactions.find((tx) => 
      tx.transferContent.toUpperCase() === transferContent.toUpperCase()
    );

    if (matched) {
      this.logger.log(`✅ Found EXACT match: TX ${matched.id} - "${matched.transferContent}" = ${matched.amount} VND`);
      return matched;
    }

    // 2. Contains match (search IN transaction)
    matched = transactions.find((tx) => 
      tx.transferContent.toUpperCase().includes(transferContent.toUpperCase())
    );

    if (matched) {
      this.logger.log(`✅ Found CONTAINS match: TX ${matched.id} - "${matched.transferContent}" contains "${transferContent}"`);
      return matched;
    }

    // 3. Reverse contains (transaction IN search) - for "SUBUPG-0946" contains "SUB0946"
    matched = transactions.find((tx) => 
      transferContent.toUpperCase().includes(tx.transferContent.toUpperCase())
    );

    if (matched) {
      this.logger.log(`✅ Found REVERSE match: "${transferContent}" contains TX ${matched.id} - "${matched.transferContent}"`);
      return matched;
    }

    // 4. Normalized match (remove all special chars)
    matched = transactions.find((tx) => {
      const normalizedTxContent = normalizeContent(tx.transferContent);
      this.logger.debug(`  Comparing: "${normalizedTxContent}" vs "${searchContent}"`);
      return normalizedTxContent.includes(searchContent) || searchContent.includes(normalizedTxContent);
    });

    if (matched) {
      this.logger.log(`✅ Found NORMALIZED match: TX ${matched.id} - "${matched.transferContent}"`);
      return matched;
    }

    // No match found
    this.logger.warn(`❌ No matching transaction found for: "${transferContent}"`);
    this.logger.warn(`   Searched in: ${transactions.map(t => `"${t.transferContent}"`).join(', ')}`);

    return null;
  }

  /**
   * Create payment intent using platform config (for subscription payments)
   * 
   * This uses the platform's SePay account, not tenant's account.
   * Used for tenant subscription upgrades.
   * 
   * @param referenceId - Reference ID (e.g., subscription upgrade request ID)
   * @param amount - Amount in VND
   * @param description - Payment description
   * @returns Payment intent with QR code
   */
  async createPlatformPaymentIntent(
    referenceId: string,
    amount: number,
    description?: string,
  ): Promise<PaymentIntent> {
    this.logger.log(
      `Creating platform payment intent: ${referenceId} - Amount: ${amount} VND`,
    );

    if (!this.platformAccountNumber || !this.platformBankCode) {
      throw new PaymentProviderInvalidRequestException(
        'Platform SePay config not set. Check SEPAY_ACCOUNT_NUMBER and SEPAY_BANK_CODE in .env',
      );
    }

    try {
      // Generate transfer content for subscription payment
      // Format: SUB{referenceId} to differentiate from order payments (DH{orderId})
      // Use full referenceId to ensure uniqueness for each payment attempt
      const transferContent = `SUB${referenceId.toUpperCase()}`;

      // Generate VietQR content using platform config
      const qrContent = this.generateVietQRContent(amount, transferContent);

      // Generate deep link
      const deepLink = this.generateDeepLink(amount, transferContent);

      const paymentIntent: PaymentIntent = {
        paymentId: '', // Will be set by calling service
        orderId: referenceId, // Use referenceId as orderId for consistency
        amount,
        currency: 'VND',
        qrContent,
        deepLink,
        transferContent,
        accountNumber: this.platformAccountNumber,
        accountName: this.platformAccountName || 'TKOB Platform',
        bankCode: this.platformBankCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        providerData: {
          provider: 'sepay',
          type: 'subscription',
          version: '1.0',
          description,
        },
      };

      this.logger.log(
        `Platform payment intent created - Transfer: ${transferContent}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to create platform payment intent: ${error.message}`,
      );
      throw new PaymentProviderException(
        'Failed to create platform payment intent',
        'CREATE_INTENT_ERROR',
        500,
      );
    }
  }

  /**
   * Generate transfer content for payment matching
   *
   * Format: DH{orderId}
   * Example: DH123456
   *
   * @param orderId - Order identifier
   * @returns Transfer content string
   */
  private generateTransferContent(orderId: string): string {
    return `DH${orderId}`;
  }

  /**
   * Generate VietQR content string
   *
   * VietQR Format (compact):
   * 2|{bank_code}|{account_number}|{account_name}|{amount}|{content}|0
   *
   * @param amount - Payment amount
   * @param transferContent - Transfer content/description
   * @returns VietQR content string
   */
  private generateVietQRContent(
    amount: number,
    transferContent: string,
  ): string {
    // VietQR Compact Format v2
    return `2|${this.platformBankCode}|${this.platformAccountNumber}|${this.platformAccountName}|${amount}|${transferContent}|0`;
  }

  /**
   * Generate VietQR content string with custom config
   *
   * @param amount - Payment amount
   * @param transferContent - Transfer content/description
   * @param bankCode - Bank code
   * @param accountNumber - Account number
   * @param accountName - Account name
   * @returns VietQR content string
   */
  private generateVietQRContentWithConfig(
    amount: number,
    transferContent: string,
    bankCode: string,
    accountNumber: string,
    accountName: string,
  ): string {
    // VietQR Compact Format v2
    return `2|${bankCode}|${accountNumber}|${accountName}|${amount}|${transferContent}|0`;
  }

  /**
   * Generate deep link for mobile banking apps
   *
   * Format: Banking app specific URL schemes
   * For now, return a generic banking URL
   *
   * @param amount - Payment amount
   * @param transferContent - Transfer content
   * @returns Deep link URL
   */
  private generateDeepLink(amount: number, transferContent: string): string {
    // Generic banking deep link (works with most Vietnamese banking apps)
    const params = new URLSearchParams({
      bankCode: this.platformBankCode,
      accountNumber: this.platformAccountNumber,
      accountName: this.platformAccountName,
      amount: amount.toString(),
      content: transferContent,
    });

    return `banking://transfer?${params.toString()}`;
  }

  /**
   * Generate deep link for mobile banking apps with custom config
   *
   * @param amount - Payment amount
   * @param transferContent - Transfer content
   * @param bankCode - Bank code
   * @param accountNumber - Account number
   * @returns Deep link URL
   */
  private generateDeepLinkWithConfig(
    amount: number,
    transferContent: string,
    bankCode: string,
    accountNumber: string,
  ): string {
    const params = new URLSearchParams({
      bankCode,
      accountNumber,
      amount: amount.toString(),
      content: transferContent,
    });

    return `banking://transfer?${params.toString()}`;
  }

  /**
   * Execute HTTP request with retry logic
   *
   * Implements exponential backoff for transient failures (network errors, 5xx).
   * Does not retry 4xx errors.
   *
   * @param requestFn - Function that returns axios promise
   * @param attempt - Current attempt number
   * @returns Response data
   * @throws PaymentProviderException on final failure
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const isRetryable = this.isRetryableError(error);
      const shouldRetry = isRetryable && attempt < this.retryAttempts;

      if (!shouldRetry) {
        throw this.handleHttpError(error);
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      this.logger.warn(
        `Request failed (attempt ${attempt}/${this.retryAttempts}). Retrying in ${delay}ms...`,
      );

      await this.sleep(delay);
      return this.executeWithRetry(requestFn, attempt + 1);
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network errors (no response)
      if (!axiosError.response) {
        return true;
      }

      // Server errors (5xx)
      const status = axiosError.response.status;
      if (status >= 500 && status < 600) {
        return true;
      }

      // Rate limit (429) - retryable after delay
      if (status === 429) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle HTTP errors and convert to PaymentProviderException
   */
  private handleHttpError(error: any): PaymentProviderException {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error (no response)
      if (!axiosError.response) {
        return new PaymentProviderNetworkException(
          `Network error: ${axiosError.message}`,
          axiosError,
        );
      }

      const status = axiosError.response.status;
      const data = axiosError.response.data;

      // Rate limit
      if (status === 429) {
        const retryAfter = axiosError.response.headers['retry-after'];
        return new PaymentProviderRateLimitException(
          'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter) : undefined,
        );
      }

      // Client error (4xx)
      if (status >= 400 && status < 500) {
        return new PaymentProviderInvalidRequestException(
          `Invalid request: ${JSON.stringify(data)}`,
          data,
        );
      }

      // Server error (5xx)
      return new PaymentProviderException(
        `Server error: ${status}`,
        'SERVER_ERROR',
        status,
        data,
      );
    }

    // Unknown error
    return new PaymentProviderException(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      500,
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
