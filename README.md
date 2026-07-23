# Notes Improviser - Deployment Guide

## 🚀 Deploy to Vercel

This project consists of two parts:
- **Client**: Next.js frontend
- **Server**: Express backend

### Prerequisites

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Have accounts ready:
   - Vercel account
   - MongoDB Atlas (for database)
   - Clerk account (for authentication)
   - OpenAI API key (for AI features)
   - Google Gemini API key (optional)

---

## Step 1: Deploy Backend Server First

Navigate to the server directory and deploy:

```bash
cd server
vercel
```

Follow the prompts:
- Set up and deploy: **Y**
- Scope: Select your account
- Link to existing project: **N**
- Project name: `notes-improviser-server` (or your choice)
- Directory: `./` (current directory)
- Override settings: **N**

After deployment, note the **production URL** (e.g., `https://notes-improviser-server.vercel.app`)

### Configure Server Environment Variables

Run this command in the `server` directory:

```bash
vercel env add MONGODB_URI
```

Add all required environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `GEMINI_API_KEY` - Your Google Gemini API key (optional)
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Your Clerk webhook secret
- `NODE_ENV` - Set to `production`
- `CLIENT_URL` - Will be your frontend URL (add after frontend deployment)

Then redeploy:
```bash
vercel --prod
```

---

## Step 2: Deploy Frontend Client

Navigate to the client directory:

```bash
cd ../client
```

Update the `vercel.json` file with your actual server URL:
- Replace `https://your-server-deployment.vercel.app` with your actual backend URL from Step 1

Deploy:
```bash
vercel
```

Follow the prompts:
- Set up and deploy: **Y**
- Scope: Select your account
- Link to existing project: **N**
- Project name: `notes-improviser` (or your choice)
- Directory: `./` (current directory)
- Override settings: **N**

### Configure Client Environment Variables

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_API_URL
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/sign-up`
- `NEXT_PUBLIC_API_URL` - Your backend URL (e.g., `https://notes-improviser-server.vercel.app/api`)

Then redeploy:
```bash
vercel --prod
```

---

## Step 3: Update Backend with Frontend URL

Go back to server directory and update the `CLIENT_URL` environment variable:

```bash
cd ../server
vercel env add CLIENT_URL
```

Enter your frontend URL (e.g., `https://notes-improviser.vercel.app`)

Redeploy the server:
```bash
vercel --prod
```

---

## Step 4: Configure Clerk Webhooks

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your server webhook URL: `https://your-server-url.vercel.app/api/webhooks/clerk`
6. Select events to listen to (e.g., `user.created`, `user.updated`, `user.deleted`)
7. Copy the **Signing Secret** and add it to your server environment variables as `CLERK_WEBHOOK_SECRET`
8. Redeploy the server

---

## Step 5: Update Clerk URLs

In your Clerk Dashboard:
1. Go to **Paths**
2. Update the following URLs to match your Vercel deployment:
   - Sign-in URL: `https://your-frontend-url.vercel.app/sign-in`
   - Sign-up URL: `https://your-frontend-url.vercel.app/sign-up`
   - After sign-in URL: `https://your-frontend-url.vercel.app/dashboard`
   - After sign-up URL: `https://your-frontend-url.vercel.app/dashboard`

---

## Alternative: Using Vercel Dashboard

You can also deploy through the Vercel web interface:

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Deploy server first, then client
5. Add environment variables in the project settings

---

## Environment Variables Summary

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### Client (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

---

## Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version compatibility

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in server
- Ensure environment variables are set in Vercel

### Database Connection Issues
- Whitelist Vercel IP addresses in MongoDB Atlas (or allow access from anywhere)
- Verify MongoDB connection string is correct

### Clerk Authentication Issues
- Verify all Clerk environment variables are set
- Check Clerk dashboard URLs match your deployment
- Ensure webhook secret is configured correctly

---

## Local Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development servers
cd server && npm run dev  # Port 5000
cd client && npm run dev   # Port 3000
```

---

## Useful Commands

```bash
# View deployment logs
vercel logs

# List all deployments
vercel list

# Remove a deployment
vercel remove [deployment-url]

# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

---

## Production URLs

After deployment, your URLs will look like:
- **Frontend**: https://notes-improviser.vercel.app
- **Backend**: https://notes-improviser-server.vercel.app
- **API Health**: https://notes-improviser-server.vercel.app/api/health

---

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check [Clerk Documentation](https://clerk.com/docs)
