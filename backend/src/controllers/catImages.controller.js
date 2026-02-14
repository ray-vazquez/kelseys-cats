import { CatService } from "../services/CatService.js";

/**
 * Upload additional images for a cat
 * POST /api/cats/:id/images
 * Accepts: multipart/form-data with 'images' field (array of files)
 */
export async function uploadCatImages(req, res, next) {
  try {
    const catId = req.params.id;
    
    // Check if cat exists
    const cat = await CatService.getCatWithTags(catId);
    if (!cat) {
      return res.status(404).json({ error: "Cat not found" });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    // Convert uploaded files to base64 or URLs (depending on your storage strategy)
    // For now, we'll store as data URLs in JSON
    const imageUrls = req.files.map(file => {
      const base64 = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64}`;
    });

    // Get existing additional_images
    let existingImages = [];
    try {
      if (cat.additional_images) {
        existingImages = typeof cat.additional_images === 'string' 
          ? JSON.parse(cat.additional_images)
          : cat.additional_images;
      }
    } catch (e) {
      console.error('Failed to parse existing images:', e);
      existingImages = [];
    }

    // Merge new images with existing (limit to 10 total)
    const allImages = [...existingImages, ...imageUrls].slice(0, 10);

    // Update cat with new images
    const updated = await CatService.updateCat(catId, {
      additional_images: JSON.stringify(allImages)
    });

    res.json({
      message: `${imageUrls.length} image(s) uploaded successfully`,
      totalImages: allImages.length,
      images: allImages
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get additional images for a cat
 * GET /api/cats/:id/images
 */
export async function getCatImages(req, res, next) {
  try {
    const cat = await CatService.getCatWithTags(req.params.id);
    if (!cat) {
      return res.status(404).json({ error: "Cat not found" });
    }

    console.log('getCatImages - Raw additional_images:', cat.additional_images);
    console.log('getCatImages - Type:', typeof cat.additional_images);

    let images = [];
    if (cat.additional_images) {
      try {
        // Handle both string and already-parsed array
        images = typeof cat.additional_images === 'string' 
          ? JSON.parse(cat.additional_images)
          : cat.additional_images;
        
        console.log('getCatImages - Parsed images:', images);
      } catch (e) {
        console.error('Failed to parse additional_images:', e);
        images = [];
      }
    }

    res.json({
      catId: cat.id,
      catName: cat.name,
      mainImage: cat.main_image_url,
      additionalImages: images,
      count: images.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a specific additional image
 * DELETE /api/cats/:id/images/:index
 */
export async function deleteCatImage(req, res, next) {
  try {
    const { id, index } = req.params;
    const imageIndex = parseInt(index, 10);

    const cat = await CatService.getCatWithTags(id);
    if (!cat) {
      return res.status(404).json({ error: "Cat not found" });
    }

    let images = [];
    try {
      if (cat.additional_images) {
        images = typeof cat.additional_images === 'string'
          ? JSON.parse(cat.additional_images)
          : cat.additional_images;
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid images data" });
    }

    if (imageIndex < 0 || imageIndex >= images.length) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Remove image at index
    images.splice(imageIndex, 1);

    // Update cat
    await CatService.updateCat(id, {
      additional_images: JSON.stringify(images)
    });

    res.json({
      message: "Image deleted successfully",
      remainingImages: images.length
    });
  } catch (err) {
    next(err);
  }
}
