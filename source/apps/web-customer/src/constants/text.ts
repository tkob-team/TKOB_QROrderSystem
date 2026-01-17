/**
 * Centralized Text Constants
 * All customer app text in English only
 */

// ============================================================================
// COMMON
// ============================================================================

export const COMMON_TEXT = {
  // Actions
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  edit: 'Edit',
  delete: 'Delete',
  remove: 'Remove',
  add: 'Add',
  update: 'Update',
  submit: 'Submit',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  continue: 'Continue',
  done: 'Done',
  retry: 'Retry',
  refresh: 'Refresh',
  
  // States
  loading: 'Loading...',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
  
  // Navigation
  home: 'Home',
  menu: 'Menu',
  cart: 'Cart',
  orders: 'Orders',
  profile: 'Profile',
  
  // General
  table: 'Table',
  guests: 'guests',
  guest: 'guest',
  items: 'items',
  item: 'item',
  total: 'Total',
  subtotal: 'Subtotal',
  of: 'of',
  page: 'Page',
  restaurant: 'Restaurant',
  
  // Empty states
  noData: 'No data available',
  nothingHere: 'Nothing here yet',
  comingSoon: 'Coming soon',
} as const

// ============================================================================
// MENU FEATURE
// ============================================================================

export const MENU_TEXT = {
  // Header
  table: 'Table',
  tableLabel: 'Table',
  guests: 'guests',
  guestsLabel: 'guests',
  
  // Search & Filter
  searchPlaceholder: 'Search dishes...',
  sort: 'Sort',
  sortButton: 'Sort Options',
  filters: 'Filters',
  clearFilters: 'Clear filters',
  chefRecommended: 'Chef Recommended Only',
  
  // Sort options
  displayOrder: 'Default',
  sortDefault: 'Default',
  popularityAsc: 'Popularity (Low to High)',
  sortPopularityAsc: 'Popularity (Low to High)',
  popularityDesc: 'Popularity (High to Low)',
  sortPopularityDesc: 'Popularity (High to Low)',
  priceAsc: 'Price (Low to High)',
  sortPriceAsc: 'Price (Low to High)',
  priceDesc: 'Price (High to Low)',
  sortPriceDesc: 'Price (High to Low)',
  nameAsc: 'Name (A to Z)',
  sortNameAsc: 'Name (A to Z)',
  nameDesc: 'Name (Z to A)',
  sortNameDesc: 'Name (Z to A)',
  
  // Pagination
  previous: 'Previous',
  next: 'Next',
  page: 'Page',
  of: 'of',
  
  // Empty state
  noDishes: 'No dishes found',
  noDishesDesc: 'Try adjusting your filters or search term',
  
  // Categories
  allCategories: 'All',
  categories: 'Categories',
} as const

// ============================================================================
// ITEM DETAIL FEATURE
// ============================================================================

export const ITEM_DETAIL_TEXT = {
  // General
  itemDetails: 'Item Details',
  description: 'Description',
  ingredients: 'Ingredients',
  
  // Options
  required: 'Required',
  optional: 'Optional',
  chooseSize: 'Choose Size',
  addOns: 'Add-ons',
  extras: 'Extras',
  customizations: 'Customizations',
  
  // Special instructions
  specialInstructions: 'Special Instructions',
  specialInstructionsPlaceholder: 'Any special requests? (e.g., no onions, extra spicy)',
  notes: 'Notes',
  
  // Quantity
  quantity: 'Quantity',
  
  // Actions
  addToCart: 'Add to Cart',
  updateCart: 'Update Cart',
  
  // Badges
  popular: 'Popular',
  new: 'New',
  spicy: 'Spicy',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten Free',
  chefRecommended: 'Chef Recommended',
  
  // Status
  available: 'Available',
  unavailable: 'Unavailable',
  outOfStock: 'Out of Stock',
} as const

// ============================================================================
// CART FEATURE
// ============================================================================

export const CART_TEXT = {
  // Header
  title: 'Your Cart',
  cartEmpty: 'Your cart is empty',
  cartEmptyDesc: 'Start adding delicious items!',
  
  // Items
  items: 'items',
  item: 'item',
  inCart: 'in cart',
  
  // Actions
  addToCart: 'Add to Cart',
  removeFromCart: 'Remove from Cart',
  clearCart: 'Clear Cart',
  updateQuantity: 'Update Quantity',
  viewCart: 'View Cart',
  
  // Summary
  subtotal: 'Subtotal',
  tax: 'Tax',
  serviceCharge: 'Service Charge',
  total: 'Total',
  
  // Checkout
  proceedToCheckout: 'Proceed to Checkout',
  checkout: 'Checkout',
  
  // Modifiers
  size: 'Size',
  addOns: 'Add-ons',
  customizations: 'Customizations',
  
  // Confirmations
  clearCartConfirm: 'Are you sure you want to clear your cart?',
  removeItemConfirm: 'Remove this item from cart?',
  
  // Toast messages
  itemAdded: 'Item added to cart',
  itemRemoved: 'Item removed from cart',
  cartCleared: 'Cart cleared',
  cartUpdated: 'Cart updated',
} as const

// ============================================================================
// CHECKOUT FEATURE
// ============================================================================

export const CHECKOUT_TEXT = {
  // Header
  title: 'Checkout',
  review: 'Review Order',
  
  // Customer info
  customerInfo: 'Customer Information',
  customerInfoOptional: 'Customer Information (Optional)',
  name: 'Name',
  namePlaceholder: 'Enter your name',
  nameRequired: 'Name is required',
  phone: 'Phone',
  phonePlaceholder: 'Enter your phone number',
  phoneRequired: 'Phone number is required',
  phoneInvalid: 'Please enter a valid phone number',
  email: 'Email',
  emailPlaceholder: 'Enter your email',
  emailOptional: 'Email (Optional)',
  emailInvalid: 'Please enter a valid email address',
  
  // Delivery / Dine-in
  orderType: 'Order Type',
  dineIn: 'Dine In',
  takeout: 'Takeout',
  delivery: 'Delivery',
  
  // Special requests
  specialRequests: 'Special Requests',
  specialRequestsPlaceholder: 'Any special requests for your order?',
  notes: 'Notes',
  notesPlaceholder: 'Add a note (optional)',
  
  // Order summary
  orderSummary: 'Order Summary',
  itemsOrdered: 'Items Ordered',
  
  // Payment
  paymentMethod: 'Payment Method',
  selectPaymentMethod: 'Select Payment Method',
  paymentInfo: 'Payment Information',
  
  // Totals
  subtotal: 'Subtotal',
  tax: 'Tax',
  serviceCharge: 'Service Charge',
  deliveryFee: 'Delivery Fee',
  discount: 'Discount',
  total: 'Total',
  
  // Actions
  placeOrder: 'Place Order',
  editOrder: 'Edit Order',
  backToCart: 'Back to Cart',
  
  // Validation
  pleaseFillRequired: 'Please fill in all required fields',
  pleaseSelectPayment: 'Please select a payment method',
  
  // Processing
  processingOrder: 'Processing your order...',
  pleaseWait: 'Please wait',
} as const

// ============================================================================
// PAYMENT FEATURE
// ============================================================================

export const PAYMENT_TEXT = {
  // Methods
  paymentMethod: 'Payment Method',
  selectMethod: 'Select Payment Method',
  card: 'Credit/Debit Card',
  cash: 'Cash',
  eWallet: 'E-Wallet',
  qrCode: 'QR Code',
  sepay: 'SePay',
  
  // Card payment
  cardNumber: 'Card Number',
  cardNumberPlaceholder: '1234 5678 9012 3456',
  expiryDate: 'Expiry Date',
  expiryDatePlaceholder: 'MM/YY',
  cvv: 'CVV',
  cvvPlaceholder: '123',
  cardholderName: 'Cardholder Name',
  cardholderNamePlaceholder: 'Name on card',
  
  // QR payment
  scanQR: 'Scan QR Code to Pay',
  qrInstructions: 'Open your banking app and scan this QR code',
  qrExpires: 'QR code expires in',
  
  // Currency conversion
  payInVND: 'Pay in VND',
  payInUSD: 'Pay in USD',
  equivalentVND: 'Equivalent VND',
  exchangeRate: 'Exchange Rate',
  conversionNote: 'Conversion rate is approximate and may vary',
  
  // Status
  paymentPending: 'Payment Pending',
  paymentProcessing: 'Processing Payment...',
  paymentSuccess: 'Payment Successful',
  paymentFailed: 'Payment Failed',
  
  // Actions
  payNow: 'Pay Now',
  payAmount: 'Pay',
  tryAgain: 'Try Again',
  changeMethod: 'Change Payment Method',
  
  // Security
  securePayment: 'Secure Payment',
  encryptedTransaction: 'Your transaction is encrypted and secure',
} as const

// ============================================================================
// ORDERS FEATURE
// ============================================================================

export const ORDERS_TEXT = {
  // Header
  title: 'Orders',
  myOrders: 'My Orders',
  orderHistory: 'Order History',
  
  // Current session
  currentSession: 'Current Session',
  activeOrder: 'Active Order',
  noActiveOrder: 'No Active Orders',
  noActiveOrderDesc: 'Place an order to see it here',
  
  // Payment status
  paymentStatus: 'Payment Status',
  paid: 'Paid',
  unpaid: 'Unpaid',
  
  // Session
  sessionNote: 'Payment received. Your session will close after all items are served.',
  sessionActive: 'Session Active',
  sessionCompleted: 'Session Completed',
  
  // History
  pastOrders: 'Past Orders',
  noPastOrders: 'No Past Orders',
  noPastOrdersDesc: 'Your order history will appear here',
  signInPrompt: 'Sign in to view your order history',
  signInButton: 'Sign In',
  
  // Order details
  orderDetails: 'Order Details',
  orderId: 'Order ID',
  date: 'Date',
  time: 'Time',
  table: 'Table',
  items: 'items',
  status: 'Status',
  
  // Order status
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  completed: 'Completed',
  cancelled: 'Cancelled',
  
  // Order items
  orderedItems: 'Ordered Items',
  quantity: 'Quantity',
  size: 'Size',
  addOns: 'Add-ons',
  specialInstructions: 'Special Instructions',
  noNotes: 'No notes',
  
  // Price summary
  priceSummary: 'Price Summary',
  subtotal: 'Subtotal',
  tax: 'Tax',
  serviceCharge: 'Service Charge',
  total: 'Total',
  
  // Payment info
  paymentInfo: 'Payment Information',
  paymentMethod: 'Payment Method',
  paidByCard: 'Paid by Card',
  paidByCash: 'Paid by Cash',
  paidByEWallet: 'Paid by E-Wallet',
  
  // Actions
  viewDetails: 'View Details',
  reorder: 'Reorder',
  trackOrder: 'Track Order',
  cancelOrder: 'Cancel Order',
  
  // Confirmations
  orderConfirmed: 'Order Confirmed',
  orderConfirmedDesc: 'Your order has been confirmed and is being prepared',
  thankYou: 'Thank you for your order!',
} as const

// ============================================================================
// PROFILE FEATURE
// ============================================================================

export const PROFILE_TEXT = {
  // Header
  title: 'Profile',
  myProfile: 'My Profile',
  account: 'Account',
  
  // Login
  loginTitle: 'Sign In to Your Account',
  loginDesc: 'Access your order history, saved preferences, and more',
  loginButton: 'Sign In',
  signUp: 'Sign Up',
  
  // Guest
  guestTitle: 'Continue as Guest',
  guestDesc: 'You can still order without signing in',
  continueAsGuest: 'Continue as Guest',
  limitedFeatures: 'Limited Features',
  
  // Menu options
  orderHistory: 'Order History',
  savedAddresses: 'Saved Addresses',
  paymentMethods: 'Payment Methods',
  preferences: 'Preferences',
  language: 'Language',
  support: 'Support',
  contactUs: 'Contact Us',
  about: 'About',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  
  // Account actions
  editProfile: 'Edit Profile',
  changePassword: 'Change Password',
  signOut: 'Sign Out',
  deleteAccount: 'Delete Account',
  
  // Edit profile
  editProfileTitle: 'Edit Profile',
  fullName: 'Full Name',
  fullNamePlaceholder: 'Enter your full name',
  fullNameRequired: 'Full name is required',
  phone: 'Phone',
  phonePlaceholder: 'Enter your phone number',
  email: 'Email',
  emailPlaceholder: 'Enter your email',
  saveButton: 'Save Changes',
  cancelButton: 'Cancel',
  
  // Messages
  profileUpdated: 'Profile updated successfully',
  updateFailed: 'Failed to update profile',
  errorOccurred: 'An error occurred',
  
  // Password change
  changePasswordTitle: 'Change Password',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm New Password',
  currentPasswordPlaceholder: 'Enter current password',
  newPasswordPlaceholder: 'Enter new password',
  confirmPasswordPlaceholder: 'Confirm new password',
  currentPasswordRequired: 'Current password is required',
  newPasswordRequired: 'New password is required',
  confirmPasswordRequired: 'Confirm password is required',
  passwordsNoMatch: 'Passwords do not match',
  changePasswordButton: 'Change Password',
  passwordChanged: 'Password changed successfully',
  changePasswordFailed: 'Failed to change password',
  
  // Password strength
  passwordStrength: 'Password Strength',
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
  passwordRequirements: 'Password Requirements',
  requirementMinLength: 'At least 8 characters',
  requirementUppercase: 'At least one uppercase letter',
  requirementLowercase: 'At least one lowercase letter',
  requirementNumber: 'At least one number',
  requirementSpecial: 'At least one special character',
  
  // Verification
  verifyEmail: 'Verify Email',
  verifyNow: 'Verify Now',
  emailNotVerified: 'Email not verified',
  emailVerified: 'Email verified',
} as const

// ============================================================================
// AUTH FEATURE
// ============================================================================

export const AUTH_TEXT = {
  // Login
  loginTitle: 'Sign In',
  loginSubtitle: 'Welcome back! Sign in to continue',
  emailLabel: 'Email Address',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot password?',
  signInButton: 'Sign In',
  orContinueWith: 'or continue with',
  continueWithGoogle: 'Continue with Google',
  continueGuest: 'Continue as Guest',
  limitedFeatures: 'Limited Features',
  noAccount: "Don't have an account?",
  signUp: 'Sign Up',
  
  // Register
  registerTitle: 'Create Account',
  registerSubtitle: 'Sign up to get started',
  fullName: 'Full Name',
  fullNamePlaceholder: 'Enter your full name',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your password',
  agreeToTerms: 'I agree to the',
  termsOfService: 'Terms of Service',
  and: 'and',
  privacyPolicy: 'Privacy Policy',
  createAccountButton: 'Create Account',
  alreadyHaveAccount: 'Already have an account?',
  signIn: 'Sign In',
  
  // Forgot password
  forgotPasswordTitle: 'Forgot Password',
  forgotPasswordSubtitle: 'Enter your email to reset your password',
  sendResetLink: 'Send Reset Link',
  backToLogin: 'Back to Sign In',
  
  // Reset password
  resetPasswordTitle: 'Reset Password',
  resetPasswordSubtitle: 'Enter your new password',
  resetPasswordButton: 'Reset Password',
  
  // Validation
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email',
  passwordRequired: 'Password is required',
  passwordMinLength: 'Password must be at least 8 characters',
  passwordsNoMatch: 'Passwords do not match',
  fullNameRequired: 'Full name is required',
  termsRequired: 'You must agree to the terms and conditions',
  
  // Success messages
  loginSuccess: 'Signed in successfully',
  registerSuccess: 'Account created successfully',
  resetLinkSent: 'Password reset link sent to your email',
  passwordResetSuccess: 'Password reset successfully',
  
  // Error messages
  loginFailed: 'Sign in failed. Please check your credentials.',
  registerFailed: 'Failed to create account. Please try again.',
  invalidCredentials: 'Invalid email or password',
  emailAlreadyExists: 'Email already exists',
  userNotFound: 'User not found',
  tooManyAttempts: 'Too many attempts. Please try again later.',
} as const

// ============================================================================
// LANDING FEATURE
// ============================================================================

export const LANDING_TEXT = {
  // Welcome
  welcome: 'Welcome to',
  welcomeBack: 'Welcome back!',
  
  // QR session
  validQR: 'QR Code is valid for today',
  validText: 'Valid for today',
  scanQR: 'Scan QR code at your table',
  qrExpired: 'QR code has expired',
  invalidQR: 'Invalid QR code',
  
  // Guest count
  guestCount: (count?: number) => count ? `${count} guests` : 'Welcome',
  selectGuests: 'Select number of guests',
  
  // Instructions
  helperText: 'Browse the menu and order right from your table',
  instructions: 'How to order:',
  step1: '1. Browse our menu',
  step2: '2. Add items to your cart',
  step3: '3. Review and place your order',
  step4: '4. Enjoy your meal!',
  
  // Actions
  viewMenu: 'View Menu',
  startOrdering: 'Start Ordering',
  browseMenu: 'Browse Menu',
  ctaButton: 'View Menu',
  
  // Session info
  sessionActive: 'Session Active',
  tableNumber: 'Table',
  tableInfo: (tableNum: string | number) => `Table ${tableNum}`,
  
  // Loading
  loading: 'Loading...',
} as const

// ============================================================================
// ERROR FEATURE
// ============================================================================

export const ERROR_TEXT = {
  // General errors
  somethingWentWrong: 'Oops! Something went wrong',
  errorOccurred: 'An error occurred',
  tryAgain: 'Please try again',
  contactSupportMessage: 'Contact support if the problem persists',
  
  // Network errors
  networkError: 'Network error',
  noInternet: 'No internet connection',
  checkConnection: 'Please check your internet connection',
  serverError: 'Server error',
  serviceUnavailable: 'Service temporarily unavailable',
  
  // Session errors
  sessionExpired: 'Session Expired',
  sessionExpiredDesc: 'Your dining session has expired. Please scan the QR code at your table again to continue.',
  scanQRAgain: 'Scan QR Again',
  
  // Menu errors
  menuLoadFailed: 'Failed to load menu',
  itemNotAvailable: 'Item not available',
  categoryNotFound: 'Category not found',
  
  // Cart errors
  cartError: 'Cart error',
  cartLoadFailed: 'Failed to load cart',
  addToCartFailed: 'Failed to add item to cart',
  updateCartFailed: 'Failed to update cart',
  
  // Order errors
  orderFailed: 'Order failed',
  orderNotFound: 'Order not found',
  invalidOrder: 'Invalid order',
  cannotPlaceOrder: 'Cannot place order',
  
  // Payment errors
  paymentFailed: 'Payment failed',
  paymentCancelled: 'Payment cancelled',
  invalidPaymentMethod: 'Invalid payment method',
  transactionFailed: 'Transaction failed',
  
  // Validation errors
  validationError: 'Validation error',
  requiredField: 'This field is required',
  invalidInput: 'Invalid input',
  invalidFormat: 'Invalid format',
  
  // 404
  pageNotFound: 'Page Not Found',
  pageNotFoundDesc: "The page you're looking for doesn't exist",
  goHome: 'Go Home',
  goBack: 'Go Back',
  
  // 403
  accessDenied: 'Access Denied',
  accessDeniedDesc: "You don't have permission to access this page",
  
  // 500
  internalError: 'Internal Server Error',
  internalErrorDesc: "We're working to fix this issue",
  
  // Actions
  retry: 'Retry',
  reload: 'Reload',
  goToHome: 'Go to Home',
  contactSupport: 'Contact Support',
} as const

// ============================================================================
// OFFLINE FEATURE
// ============================================================================

export const OFFLINE_TEXT = {
  // Banner
  offline: 'Offline',
  offlineMessage: 'You are currently offline',
  offlineDesc: 'Some features may not be available',
  
  // Connection
  reconnecting: 'Reconnecting...',
  backOnline: 'Back Online',
  connected: 'Connected',
  
  // Last updated
  lastUpdated: 'Last updated',
  justNow: 'just now',
  minutesAgo: (minutes: number) => `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`,
  hoursAgo: (hours: number) => `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`,
  
  // Actions
  tryToReconnect: 'Try to Reconnect',
  refresh: 'Refresh',
} as const

// ============================================================================
// TABLE FEATURE
// ============================================================================

export const TABLE_TEXT = {
  // Header
  title: 'Table Information',
  tableNumber: 'Table',
  
  // Status
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  
  // Actions
  scanQR: 'Scan QR Code',
  changeTable: 'Change Table',
  
  // Info
  guestCount: 'Number of Guests',
  updateGuestCount: 'Update Guest Count',
  
  // Session
  sessionStarted: 'Session Started',
  sessionDuration: 'Session Duration',
  endSession: 'End Session',
} as const

// ============================================================================
// TOAST / NOTIFICATIONS
// ============================================================================

export const TOAST_TEXT = {
  // Success
  success: 'Success',
  operationSuccessful: 'Operation completed successfully',
  changesSaved: 'Changes saved',
  
  // Error
  error: 'Error',
  operationFailed: 'Operation failed',
  tryAgain: 'Please try again',
  
  // Warning
  warning: 'Warning',
  
  // Info
  info: 'Information',
  
  // Actions
  dismiss: 'Dismiss',
  undo: 'Undo',
  viewDetails: 'View Details',
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Export all text constants as a single object for easy import
export const TEXT = {
  COMMON: COMMON_TEXT,
  MENU: MENU_TEXT,
  ITEM_DETAIL: ITEM_DETAIL_TEXT,
  CART: CART_TEXT,
  CHECKOUT: CHECKOUT_TEXT,
  PAYMENT: PAYMENT_TEXT,
  ORDERS: ORDERS_TEXT,
  PROFILE: PROFILE_TEXT,
  AUTH: AUTH_TEXT,
  LANDING: LANDING_TEXT,
  ERROR: ERROR_TEXT,
  OFFLINE: OFFLINE_TEXT,
  TABLE: TABLE_TEXT,
  TOAST: TOAST_TEXT,
} as const

// Type exports for TypeScript
export type CommonText = typeof COMMON_TEXT
export type MenuText = typeof MENU_TEXT
export type ItemDetailText = typeof ITEM_DETAIL_TEXT
export type CartText = typeof CART_TEXT
export type CheckoutText = typeof CHECKOUT_TEXT
export type PaymentText = typeof PAYMENT_TEXT
export type OrdersText = typeof ORDERS_TEXT
export type ProfileText = typeof PROFILE_TEXT
export type AuthText = typeof AUTH_TEXT
export type LandingText = typeof LANDING_TEXT
export type ErrorText = typeof ERROR_TEXT
export type OfflineText = typeof OFFLINE_TEXT
export type TableText = typeof TABLE_TEXT
export type ToastText = typeof TOAST_TEXT
export type AllText = typeof TEXT
