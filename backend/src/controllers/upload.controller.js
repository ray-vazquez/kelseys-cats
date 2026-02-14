import axios from 'axios';
import FormData from 'form-data';

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

    // Upload to ImgBB
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    if (response.data && response.data.data) {
      return res.json({
        success: true,
        url: response.data.data.url,
        displayUrl: response.data.data.display_url,
        deleteUrl: response.data.data.delete_url,
        filename: req.file.originalname
      });
    } else {
      return res.status(500).json({ error: 'Failed to upload image to ImgBB' });
    }

  } catch (error) {
    console.error('Image upload error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Image upload failed', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
};
