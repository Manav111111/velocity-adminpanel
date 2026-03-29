const CLOUD_NAME = 'duccx9yst';
const UPLOAD_PRESET = 'velocitypro_unsigned';

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error(data.error?.message || 'Upload failed');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
