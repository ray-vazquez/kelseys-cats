# Image Upload Setup Guide

## Backend Setup Complete ✅

The following files have been created/updated:
- `backend/src/controllers/upload.controller.js` - Cloudinary upload handler
- `backend/src/routes/upload.routes.js` - Upload API routes
- `backend/server.js` - Routes registered
- `backend/.env.example` - Environment variables documented

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install cloudinary
```

### 2. Update Environment Variables
Add to your `backend/.env` file:
```env
CLOUDINARY_CLOUD_NAME=dwf4m7loy
CLOUDINARY_API_KEY=387546713819419
CLOUDINARY_API_SECRET=v3wjPHVwqbk6dotSMGEkztGl6K8
```

### 3. Restart Backend Server
```bash
cd backend
npm run stop
npm start
```

## API Endpoint

### POST `/api/upload/image`

**Authentication:** Required (JWT token in Authorization header)

**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:4000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/cat-photo.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/dwf4m7loy/image/upload/v1234567890/kelseys-cats/cat-1234567890.jpg",
  "optimizedUrl": "https://res.cloudinary.com/dwf4m7loy/image/upload/f_auto,q_auto/kelseys-cats/cat-1234567890",
  "publicId": "kelseys-cats/cat-1234567890",
  "width": 1920,
  "height": 1080,
  "format": "jpg",
  "filename": "cat-photo.jpg"
}
```

**Error Responses:**
- `400` - No file provided, invalid file type, or file too large
- `401` - Missing or invalid JWT token
- `500` - Cloudinary upload failure

## File Validation

- **Allowed formats:** JPG, PNG
- **Max file size:** 10MB
- **Storage:** Cloudinary folder `kelseys-cats/`
- **Naming:** `cat-{timestamp}`

## Features

✅ Automatic optimization (format & quality)  
✅ Secure storage on Cloudinary CDN  
✅ JWT authentication required  
✅ File type & size validation  
✅ Organized in dedicated folder  
✅ Returns both original & optimized URLs

## Next Steps

1. Test the endpoint with Postman or curl
2. Build frontend `ImageUploader.jsx` component
3. Integrate with `AdminCatEditPage.jsx`

## Troubleshooting

**"Missing or invalid JWT token"**  
→ Ensure you're logged in and passing the token in headers

**"Failed to upload image to Cloudinary"**  
→ Verify your Cloudinary credentials in `.env`

**"File size must be less than 10MB"**  
→ Compress the image before uploading
