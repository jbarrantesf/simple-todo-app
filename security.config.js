module.exports = {
  // Content Security Policy (CSP) headers
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // Example: for Bootstrap/jQuery
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // Example: for Bootstrap/jQuery
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
    },
    reportOnly: false, // Set to true to only report violations, not block them
    reportUri: "/csp-violation-report", // Endpoint to send CSP violation reports
  },

  // Cross-Origin Resource Sharing (CORS) configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'], // Allowed origins, comma-separated in env
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"], // Allowed request headers
    exposedHeaders: [], // Headers that browsers are allowed to access
    credentials: true, // Allow sending of cookies and authorization headers
    maxAge: 3600, // How long the results of a preflight request can be cached
    preflightContinue: false, // Pass the CORS preflight response to the next handler
    optionsSuccessStatus: 204, // Status code for successful OPTIONS requests
  },

  // Data Sanitization configuration
  // This typically involves libraries like `express-validator` or `sanitize-html`
  // Here, we define rules that can be applied to input data.
  sanitization: {
    // General policy for HTML sanitization (e.g., for user-generated content)
    html: {
      allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol", "li", "b", "i", "strong", "em", "br", "hr"],
      allowedAttributes: {
        a: ["href", "name", "target"],
      },
      transformTags: {
        'div': 'p', // Example transformation
      },
      stripIgnoreTag: true, // Strips tags that aren't in `allowedTags`
      stripIgnoreTagContents: ['script'], // Removes content of specific tags
      // Additional options for `sanitize-html` or similar library
    },
    // Example: specific rules for input fields
    input: {
      trim: true, // Trim whitespace from strings
      escapeHtml: true, // Escape HTML entities (e.g., < to &lt;), useful before storing in DB
      stripJs: true, // Remove JavaScript from input
      normalizeEmail: true, // Normalize email addresses
    },
  },

  // Rate Limiting configuration
  // Applied per IP address to prevent brute-force attacks and abuse.
  rateLimiting: {
    enabled: process.env.NODE_ENV === 'production', // Only enable in production
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per windowMs per IP
    message: "Too many requests from this IP, please try again after 15 minutes",
    headers: true, // Include X-RateLimit-* headers
    // Optional: different limits for different routes/actions
    login: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // Max 5 login attempts per IP per 5 minutes
      message: "Too many login attempts from this IP, please try again after 5 minutes",
    },
  },

  // JSON Web Token (JWT) configuration
  jwt: {
    secret: process.env.JWT_SECRET || "yourSuperSecretKeyForJWT", // A strong, unique secret key
    audience: process.env.JWT_AUDIENCE || "todo-app-audience", // Audience for the token
    issuer: process.env.JWT_ISSUER || "todo-app-issuer", // Issuer of the token
    expiresIn: process.env.JWT_EXPIRES_IN || "1h", // Token expiry time
    algorithm: "HS256", // Algorithm to sign the token
    refreshSecret: process.env.JWT_REFRESH_SECRET || "yourSuperSecretKeyForJWTRefresh", // Secret for refresh tokens
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // Refresh token expiry time
    cookie: {
      enabled: true, // Whether to store tokens in cookies
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
      sameSite: "Lax", // Or 'Strict' for stronger protection, 'None' for cross-site (requires secure: true)
    },
  },

  // Other general security settings
  hsts: {
    // HTTP Strict Transport Security
    enabled: process.env.NODE_ENV === 'production',
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Apply to subdomains as well
    preload: false, // Request to be included in browser preloaded HSTS list
  },

  xssProtection: {
    // X-XSS-Protection header
    enabled: true,
    value: "1; mode=block",
  },

  noSniff: {
    // X-Content-Type-Options header
    enabled: true,
  },

  hidePoweredBy: {
    // Hide X-Powered-By header
    enabled: true,
  },
};