# Cloudinary Setup Instructions

This application now uses Cloudinary for image uploads instead of Firebase Storage.

## Configuration Required

To make image uploads work, you need to configure Cloudinary with your own credentials.

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Log in to your Cloudinary dashboard

### Step 2: Get Your Credentials

1. In your Cloudinary dashboard, find your **Cloud Name**
2. Go to **Settings** → **Upload** tab
3. Create an **Unsigned Upload Preset**:
   - Click "Add upload preset"
   - Set **Mode** to "Unsigned"
   - Configure as needed (you can use defaults)
   - Save and note the **Upload Preset Name**

### Step 3: Update Configuration

Edit `src/cloudinary.js` and replace the placeholder values:

```javascript
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME"; // Replace with your Cloud Name
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; // Replace with your Upload Preset name
```

## How It Works

1. **Upload Process**: Images are uploaded directly to Cloudinary using unsigned uploads
2. **Storage**: Cloudinary URLs are stored in the application's localStorage
3. **Display**: Images are displayed using their Cloudinary URLs
4. **No Backend Required**: Uses client-side unsigned uploads for simplicity

## Features

- ✅ Image upload with Cloudinary
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Progress indication
- ✅ Error handling
- ✅ Image deletion
- ✅ Multiple images per phase

## Troubleshooting

**Upload fails with "Cloudinary not configured"**

- Check that you've updated the cloud name and upload preset in `src/cloudinary.js`

**Upload fails with "Upload failed"**

- Verify your upload preset is set to "Unsigned"
- Check file size and type restrictions
- Ensure internet connection

**Images don't display**

- Verify Cloudinary URLs are being saved correctly
- Check browser console for errors
