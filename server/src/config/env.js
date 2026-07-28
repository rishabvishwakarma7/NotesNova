/**
 * Environment variable validation on application startup
 */

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'GROQ_API_KEY',
];

const OPTIONAL_ENV_VARS = [
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'ADMIN_SECRET',
  'CLIENT_URL',
];

export function validateEnv() {
  const missing = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error(`Please check your .env file in server directory.`);
    process.exit(1);
  }

  const missingOptional = OPTIONAL_ENV_VARS.filter((v) => !process.env[v]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Optional environment variables not set: ${missingOptional.join(', ')}`);
  } else {
    console.log('✅ Environment configuration validated.');
  }
}
