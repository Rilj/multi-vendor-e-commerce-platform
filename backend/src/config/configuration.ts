export default () => ({
  port: parseInt(process.env.PORT || "4000", 10),
  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/mvecommerce",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "noreply@mvecommerce.com",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    s3Bucket: process.env.AWS_S3_BUCKET || "",
    s3Region: process.env.AWS_S3_REGION || "ap-southeast-1",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },
  geocoding: {
    url: process.env.GEOCODING_URL || "",
  },
});