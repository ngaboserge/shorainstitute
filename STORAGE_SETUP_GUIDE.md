# Supabase Storage Setup for Resource Thumbnails

## Overview
This guide explains how to set up Supabase Storage to allow trainers to upload thumbnail images for resources.

---

## Step 1: Create Storage Bucket in Supabase Dashboard

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `resources`
   - **Public bucket**: Toggle **ON** (enabled)
   - **File size limit**: 5MB (or as needed)
   - **Allowed MIME types**: Leave empty or specify `image/*`
5. Click **"Create bucket"**

### Option B: Using SQL (Alternative)

Run this SQL in the SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 2: Set Up Storage Policies

Storage policies control who can upload, view, update, and delete files.

### Run the SQL Script

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and run the entire `SETUP_STORAGE_BUCKET.sql` file
3. Click **"Run"**

The script will:
- Create the `resources` bucket (if it doesn't exist)
- Allow authenticated users to upload files to their own folder
- Allow public read access (so learners can view thumbnails)
- Allow users to update/delete their own files only

---

## Step 3: Verify Setup

### Test the Configuration

1. Log in as a trainer in your app
2. Go to **Manage Resources**
3. Click **"Create Resource"**
4. Try uploading a thumbnail image
5. Submit the form
6. Verify the image appears in the resource card

### Check Storage in Dashboard

1. Go to **Storage** > **resources** bucket
2. You should see folders named with user IDs
3. Inside each folder, you'll see uploaded thumbnail images
4. Click on an image to verify it's publicly accessible

---

## How It Works

### Upload Flow

1. **Trainer selects an image file**
   - File is validated (must be image, max 5MB)
   - Preview is shown immediately

2. **Trainer submits the form**
   - File is uploaded to Supabase Storage
   - Path: `resources/resource-thumbnails/{userId}/{timestamp}.{ext}`
   - Public URL is generated automatically

3. **URL is saved to database**
   - The `thumbnail_url` field in `resources` table is updated
   - This URL is used to display the image

### Storage Structure

```
resources/
└── resource-thumbnails/
    ├── {user-id-1}/
    │   ├── 1705089234567.jpg
    │   ├── 1705089456789.png
    │   └── ...
    ├── {user-id-2}/
    │   └── ...
    └── ...
```

### Security

- Each user can only upload to their own folder
- Users cannot access or modify other users' files
- All uploaded images are publicly readable (for display)
- File size is limited to 5MB
- Only image files are accepted

---

## Folder Structure Explained

```javascript
const fileName = `${user.id}/${Date.now()}.${fileExt}`
const filePath = `resource-thumbnails/${fileName}`
```

**Example Path:**
```
resource-thumbnails/84c39889-964d-416b-a0c1-42e26d05eb3e/1705089234567.jpg
```

- `resource-thumbnails/` - Root folder for all thumbnails
- `84c39889-964d-416b-a0c1-42e26d05eb3e/` - User's folder (their UUID)
- `1705089234567.jpg` - File with timestamp as name

---

## Alternative: Using URL Input

If storage setup is not complete, trainers can still:
1. Upload images to external services (Google Drive, Imgur, etc.)
2. Paste the public URL in the "Thumbnail URL" field
3. The image will display from the external URL

---

## Troubleshooting

### Upload Fails

**Error: "Failed to upload thumbnail"**

**Solutions:**
1. Check if the `resources` bucket exists in Storage
2. Verify storage policies are set up correctly
3. Check file size (must be < 5MB)
4. Ensure user is authenticated
5. Check browser console for detailed error

### Image Not Displaying

**Solutions:**
1. Verify the bucket is set to **Public**
2. Check if the file exists in Storage dashboard
3. Test the public URL directly in a browser
4. Check if RLS policies allow SELECT on storage.objects

### Permission Denied

**Error: "new row violates row-level security policy"**

**Solutions:**
1. Run the storage policy setup SQL again
2. Ensure user is authenticated (logged in)
3. Check if policies exist:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

### Wrong Folder Structure

**Issue: Files uploaded to wrong location**

**Solutions:**
1. Check the upload function uses correct path:
   ```javascript
   const filePath = `resource-thumbnails/${user.id}/${Date.now()}.${fileExt}`
   ```
2. Verify `user.id` is available in the component
3. Check Storage dashboard to see actual file locations

---

## Storage Limits

### Supabase Free Tier
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **File uploads**: 50MB max per file

### Recommended Limits for Production
- Thumbnail file size: 5MB max
- Recommended dimensions: 800x600px or 1200x800px
- Format: JPEG (smaller file size) or PNG (transparency)
- Compression: Use tools like TinyPNG before upload

---

## Code Reference

### Upload Function
Located in: `src/pages/trainer/ManageResources.jsx`

```javascript
const uploadThumbnail = async () => {
  if (!thumbnailFile) return formData.thumbnail_url

  setUploadingThumbnail(true)
  try {
    const fileExt = thumbnailFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const filePath = `resource-thumbnails/${fileName}`

    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, thumbnailFile)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading thumbnail:', error)
    return formData.thumbnail_url
  } finally {
    setUploadingThumbnail(false)
  }
}
```

---

## Next Steps

Once storage is set up:
1. ✅ Test uploading thumbnails as a trainer
2. ✅ Verify images display in grid view
3. ✅ Check images appear in details modal
4. ✅ Test editing resources with existing thumbnails
5. ✅ Verify learners can see thumbnails in Resources page

---

## Status

- [x] Upload functionality implemented
- [x] Preview before upload
- [x] Alternative URL input method
- [x] File validation (type, size)
- [x] Storage bucket setup SQL provided
- [ ] Storage bucket created in Supabase (YOU NEED TO DO THIS)
- [ ] Storage policies configured (RUN THE SQL)

**Next Action Required:**
👉 **Run `SETUP_STORAGE_BUCKET.sql` in Supabase SQL Editor**
