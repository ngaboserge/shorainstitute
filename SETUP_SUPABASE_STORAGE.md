# Setting Up Supabase Storage for Institution Logos

## Steps to Create the Storage Bucket

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar

3. **Create New Bucket**
   - Click "New bucket" button
   - **Name**: `public-assets`
   - **Public bucket**: Toggle ON (make it public)
   - Click "Create bucket"

4. **Set Storage Policies (if needed)**
   - Click on the `public-assets` bucket
   - Go to "Policies" tab
   - Add policy for uploads:
     ```sql
     CREATE POLICY "Allow authenticated uploads"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'public-assets');
     ```

5. **Test Upload**
   - Go back to your app
   - Navigate to Settings → Organization Profile → Edit Profile
   - Try uploading a logo
   - It should now work!

## Alternative: Use Existing Bucket

If you already have a public storage bucket with a different name, update the code:

In `src/pages/institutional/InstitutionProfile.jsx`, change line ~125:
```javascript
// Change this:
.from('public-assets')

// To your bucket name:
.from('your-bucket-name')
```

## Troubleshooting

**Error: "Bucket not found"**
- Make sure the bucket name is exactly `public-assets`
- Make sure it's set to "Public"
- Check you're using the correct Supabase project

**Error: "Permission denied"**
- Add the upload policy shown above
- Make sure you're authenticated when uploading
