/**
 * Comprehensive list of reserved usernames that cannot be claimed by users.
 * These will show a 404 page instead of the username claim interface.
 */

// Existing application routes
const APP_ROUTES = [
  // Auth routes
  'login',
  'signup', 
  'register',
  'signin',
  'logout',
  'signout',
  'auth',
  
  // Dashboard routes  
  'explore',
  'settings',
  'onboarding',
  'page',
  'post',
  
  // Legal/info pages
  'privacy',
  'terms',
  'about',
  'contact',
  'help',
  'support',
  'faq',
  'blog',
  'docs',
  'documentation',
  
  // API routes
  'api',
  'graphql',
  'webhook',
  'webhooks',
  'callback',
  'oauth',
  
  // Admin routes
  'admin',
  'administrator',
  'moderator', 
  'mod',
  'staff',
  'team',
  'management',
]

// System and technical terms
const SYSTEM_TERMS = [
  // HTTP methods and status codes
  'get',
  'post', 
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
  'connect',
  
  // Common web paths
  'www',
  'ftp',
  'mail',
  'email',
  'smtp',
  'pop',
  'imap',
  'dns',
  'cdn',
  'assets',
  'static',
  'public',
  'private',
  'secure',
  'ssl',
  'tls',
  
  // File extensions and formats
  'js',
  'css',
  'html',
  'htm',
  'xml',
  'json',
  'txt',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'zip',
  'rar',
  'tar',
  'gz',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'ico',
  'mp3',
  'mp4',
  'mov',
  'avi',
  'wmv',
  'flv',
  
  // Common directories
  'uploads',
  'download',
  'downloads',
  'files',
  'images',
  'img',
  'pics',
  'pictures',
  'videos',
  'audio',
  'media',
  'content',
  'data',
  'backup',
  'tmp',
  'temp',
  'cache',
  'logs',
  'log',
  
  // Development terms
  'test',
  'testing',
  'dev',
  'development',
  'prod',
  'production',
  'staging',
  'beta',
  'alpha',
  'demo',
  'sandbox',
  'debug',
  'localhost',
  'example',
  'sample',
  'template',
  'default',
  'config',
  'configuration',
  'env',
  'environment',
  
  // Database terms
  'db',
  'database',
  'sql',
  'mysql',
  'postgres',
  'postgresql',
  'mongodb',
  'redis',
  
  // Server terms
  'server',
  'host',
  'domain',
  'subdomain',
  'proxy',
  'load-balancer',
  'nginx',
  'apache',
  
  // Next.js specific
  '_next',
  'next',
  'vercel',
  'favicon',
  'manifest',
  'robots',
  'sitemap',
  'sw', // service worker
  'workbox',
]

// Brand protection and common usernames
const BRAND_TERMS = [
  // Platform/company related
  'rize',
  'rizeapp',
  'rize-app',
  'rize_app',
  'rizeso',
  'rize-so',
  'rize_so',
  
  // Common brand terms
  'brand',
  'company',
  'corp',
  'corporation',
  'inc',
  'llc',
  'ltd',
  'limited',
  'official',
  'verified',
  
  // Generic terms that might be confusing
  'user',
  'users',
  'profile',
  'profiles',
  'account',
  'accounts',
  'member',
  'members',
  'client',
  'clients',
  'customer',
  'customers',
  'guest',
  'guests',
  'anonymous',
  'anon',
]

// Social media and communication terms
const SOCIAL_TERMS = [
  // Major platforms
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
  'tiktok',
  'snapchat',
  'pinterest',
  'discord',
  'slack',
  'whatsapp',
  'telegram',
  'signal',
  'reddit',
  'github',
  'gitlab',
  'bitbucket',
  
  // Communication terms
  'message',
  'messages',
  'chat',
  'inbox',
  'notification',
  'notifications',
  'alerts',
  'news',
  'feed',
  'timeline',
  'story',
  'stories',
  'live',
  'stream',
  'broadcast',
]

// Security and sensitive terms
const SECURITY_TERMS = [
  // Security related
  'security',
  'password',
  'passwords',
  'token',
  'tokens',
  'key',
  'keys',
  'secret',
  'secrets',
  'hash',
  'encrypt',
  'decrypt',
  'cipher',
  'cert',
  'certificate',
  'ssl-cert',
  'private-key',
  'public-key',
  
  // Sensitive operations
  'delete',
  'remove',
  'destroy',
  'purge',
  'wipe',
  'reset',
  'recover',
  'recovery',
  'restore',
  'backup',
  'migrate',
  'migration',
  'seed',
  'import',
  'export',
  'sync',
  'clone',
]

// Potentially offensive or problematic terms
const RESTRICTED_TERMS = [
  // Common restricted usernames
  'root',
  'administrator',
  'webmaster',
  'hostmaster',
  'postmaster',
  'abuse',
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'mailer-daemon',
  'mailerdaemon',
  
  // Null/undefined terms
  'null',
  'undefined',
  'none',
  'empty',
  'void',
  'nil',
  'nan',
  'infinity',
  'true',
  'false',
  
  // Generic/placeholder terms
  'placeholder',
  'dummy',
  'fake',
  'mock',
  'lorem',
  'ipsum',
  'name',
  'username',
  'email',
  'phone',
  'address',
]

// Internet and web standards
const WEB_STANDARDS = [
  // Common subdomains
  'app',
  'mobile',
  'm',
  'wap',
  'blog',
  'shop',
  'store',
  'forum',
  'community',
  'wiki',
  'status',
  'monitor',
  'stats',
  'analytics',
  'tracking',
  'pixel',
  
  // Common paths
  'home',
  'index',
  'main',
  'dashboard',
  'portal',
  'gateway',
  'hub',
  'center',
  'console',
  'panel',
  'control',
  'manage',
  'manager',
  
  // SEO and marketing
  'seo',
  'marketing',
  'ads',
  'advertising',
  'promo',
  'promotion',
  'campaign',
  'affiliate',
  'partner',
  'sponsors',
  'sponsor',
]

/**
 * Complete list of reserved usernames
 */
export const RESERVED_USERNAMES = [
  ...APP_ROUTES,
  ...SYSTEM_TERMS,
  ...BRAND_TERMS,
  ...SOCIAL_TERMS,
  ...SECURITY_TERMS,
  ...RESTRICTED_TERMS,
  ...WEB_STANDARDS,
].map(username => username.toLowerCase())

/**
 * Check if a username is reserved and cannot be claimed
 * @param username - The username to check
 * @returns boolean - true if reserved, false if available for claiming
 */
export function isUsernameReserved(username: string): boolean {
  if (!username) return true
  
  const normalizedUsername = username.toLowerCase().trim()
  
  // Check against reserved list
  if (RESERVED_USERNAMES.includes(normalizedUsername)) {
    return true
  }
  
  // Additional pattern-based checks
  
  // Block common admin variations
  if (normalizedUsername.includes('admin') || 
      normalizedUsername.includes('root') ||
      normalizedUsername.includes('moderator')) {
    return true
  }
  
  // Block system-like patterns
  if (normalizedUsername.startsWith('sys') ||
      normalizedUsername.startsWith('system') ||
      normalizedUsername.startsWith('service') ||
      normalizedUsername.startsWith('daemon')) {
    return true
  }
  
  // Block file-like extensions
  if (normalizedUsername.includes('.')) {
    const parts = normalizedUsername.split('.')
    const lastPart = parts[parts.length - 1]
    // Common file extensions
    const fileExtensions = [
      'js', 'css', 'html', 'htm', 'xml', 'json', 'txt', 'pdf',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico',
      'mp3', 'mp4', 'mov', 'avi', 'zip', 'rar', 'tar', 'gz'
    ]
    if (fileExtensions.includes(lastPart)) {
      return true
    }
  }
  
  // Block potential security issues
  if (normalizedUsername.includes('..') ||
      normalizedUsername.includes('/') ||
      normalizedUsername.includes('\\') ||
      normalizedUsername.includes('<') ||
      normalizedUsername.includes('>')) {
    return true
  }
  
  return false
}

/**
 * Get a user-friendly message for why a username is reserved
 * @param username - The reserved username
 * @returns string - Human-readable explanation
 */
export function getReservedUsernameMessage(username: string): string {
  const normalizedUsername = username.toLowerCase().trim()
  
  if (APP_ROUTES.includes(normalizedUsername)) {
    return 'This username conflicts with an existing application route.'
  }
  
  if (normalizedUsername.includes('admin') || normalizedUsername.includes('root')) {
    return 'Administrative usernames are not available for claiming.'
  }
  
  if (BRAND_TERMS.includes(normalizedUsername)) {
    return 'This username is reserved for brand protection.'
  }
  
  if (SECURITY_TERMS.includes(normalizedUsername)) {
    return 'This username is reserved for security reasons.'
  }
  
  return 'This username is reserved and cannot be claimed.'
}
