# Environment Configuration Guide

## 📁 File Structure

```
backend/
├── .env                    # Your actual config (DO NOT COMMIT)
├── .env.example            # Template with examples
└── src/
    └── config/
        └── env.js          # Centralized env loader
```

## 🔧 Setup Instructions

### 1. Create Your .env File

```bash
cd backend
cp .env.example .env
```

### 2. Configure Required Variables

Edit `backend/.env` with your values:

```env
# Database (REQUIRED)
DB_URL=mysql://your_user:your_password@localhost:3306/kelseys_cats

# Authentication (REQUIRED)
JWT_SECRET=your-secure-random-secret-here

# Cloudinary (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=dwf4m7loy
CLOUDINARY_API_KEY=387546713819419
CLOUDINARY_API_SECRET=v3wjPHVwqbk6dotSMGEkztGl6K8
```

## 🏗️ How It Works

### Centralized Configuration

All environment variables are loaded through `src/config/env.js`:

```javascript
import { env } from './src/config/env.js';

// Use anywhere in your code:
const port = env.PORT;
const dbUrl = env.DB_URL;
```

### Benefits

✅ **Single source of truth** - All env vars defined in one place  
✅ **Type safety** - Centralized validation and defaults  
✅ **Auto-validation** - Warns about missing required variables  
✅ **No direct process.env** - Cleaner, more maintainable code

## 📋 All Available Variables

### Server Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS origin |

### Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | ✅ Yes | MySQL connection string |

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ Yes | Secret key for JWT tokens |

### Cloudinary (Image Hosting)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Your cloud name |
| `CLOUDINARY_API_KEY` | ✅ Yes | API key |
| `CLOUDINARY_API_SECRET` | ✅ Yes | API secret |

### Petfinder API (Optional)

| Variable | Required | Description |
|----------|----------|-------------|
| `PETFINDER_API_KEY` | No | Shelter integration |
| `PETFINDER_SECRET` | No | Shelter integration |

## 🔒 Security Best Practices

### ✅ DO:

- Keep `.env` file out of version control (already in `.gitignore`)
- Use strong, random secrets for `JWT_SECRET`
- Rotate secrets regularly in production
- Use different credentials for dev/staging/production

### ❌ DON'T:

- Commit `.env` to git
- Share `.env` files via email/Slack
- Use default/example values in production
- Hardcode secrets in source code

## 🚀 Production Deployment

When deploying to Railway/Render/Vercel:

1. **Don't upload .env file**
2. **Set environment variables in the hosting platform dashboard:**
   - Railway: Settings → Variables
   - Render: Environment → Environment Variables
   - Vercel: Settings → Environment Variables

3. **Required production variables:**
   ```
   DB_URL=mysql://...
   JWT_SECRET=<strong-random-secret>
   CLOUDINARY_CLOUD_NAME=dwf4m7loy
   CLOUDINARY_API_KEY=387546713819419
   CLOUDINARY_API_SECRET=v3wjPHVwqbk6dotSMGEkztGl6K8
   FRONTEND_ORIGIN=https://kelseyscats.org
   NODE_ENV=production
   ```

## 🧪 Testing

### Verify Configuration

```bash
node -e "import('./src/config/env.js').then(m => console.log(m.env))"
```

### Check for Missing Variables

The server will warn you on startup:

```
⚠️  Missing or default environment variables: JWT_SECRET
   Configure these in backend/.env for production
```

## 📚 Related Files

- [`.env.example`](/.env.example) - Template with all variables
- [`src/config/env.js`](/src/config/env.js) - Centralized loader
- [`IMAGE_UPLOAD_SETUP.md`](/docs/IMAGE_UPLOAD_SETUP.md) - Image upload guide
