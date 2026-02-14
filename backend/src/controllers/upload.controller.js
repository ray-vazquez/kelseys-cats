import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwf4m7loy', 
  api_key: process.env.CLOUDINARY_API_KEY || '387546713819419', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v3wjPHVwqbk6dotSMGEkztGl6K8'
});

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPG and PNG files are allowed' });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'File size must be less than 10MB' });
    }

    // Convert buffer to base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'kelseys-cats',
      resource_type: 'image',
      public_id: `cat-${Date.now()}`,
    }).catch((error) => {
      console.error('Cloudinary upload error:', error);
      throw error;
    });

    if (uploadResult && uploadResult.secure_url) {
      // Generate optimized URL (auto-format, auto-quality)
      const optimizedUrl = cloudinary.url(uploadResult.public_id, {
        fetch_format: 'auto',
        quality: 'auto'
      });

      return res.json({
        success: true,
        url: uploadResult.secure_url,
        optimizedUrl: optimizedUrl,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        filename: req.file.originalname
      });
    } else {
      return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ 
      error: 'Image upload failed', 
      details: error.message 
    });
  }
};
