import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (fileUri: string, fileName: string) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Simulated fallback for demonstration/prototype mode
    console.warn('Cloudinary not configured. Simulating upload.');
    return {
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      public_id: 'sample_id_' + Date.now(),
    };
  }

  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      public_id: `${Date.now()}-${fileName.split('.')[0]}`,
      resource_type: 'auto',
      folder: 'smartteach_resources',
    });
    return res;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to cloud.');
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;
