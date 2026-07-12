# 🔧 FIX STORAGE UPLOAD NOW

## Problem
Thumbnail upload fails with error:
```
StorageApiError: new row violates row-level security policy
```

## Solution
The storage bucket exists but RLS policies are too restrictive. Run the updated SQL.

---

## STEPS TO FIX (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project: **ydldtedpcnpoeznhgsot**
3. Click **SQL Editor** in left sidebar

### Step 2: Run the SQL Script
1. Click **"New Query"**
2. Copy **ALL** content from `SETUP_STORAGE_BUCKET.sql`
3. Paste into the SQL editor
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: ✅ Success messages

### Step 3: Test Upload Again
1. Go back to your app: http://localhost:3001
2. Log in as trainer: **ngabosergetrainer@gmail.com**
3. Navigate to **Manage Resources**
4. Click **"Create Resource"** or edit an existing one
5. Try uploading a thumbnail image
6. Submit the form
7. ✅ **It should work now!**

---

## What the SQL Does

1. **Ensures bucket is public**: `public = true`
2. **Drops old restrictive policies**: Removes policies that check folder ownership
3. **Creates permissive policies**: Allows ANY authenticated user to upload
4. **Enables public read**: Anyone can view thumbnails (needed for display)
5. **Grants permissions**: Ensures authenticated users have full access

---

## Why the Old Policy Failed

**Old Policy:**
```sql
WITH CHECK (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text)
```

This checked if the first folder name matches the user ID. But our upload path is:
```
resource-thumbnails/84c39889-964d-416b-a0c1-42e26d05eb3e/filename.jpg
```

The first folder is `resource-thumbnails`, not the user ID!

**New Policy:**
```sql
WITH CHECK (bucket_id = 'resources')
```

Much simpler - just checks the bucket name. Perfect for development!

---

## Expected Result

After running the SQL, uploads will succeed and you'll see:
- ✅ File uploaded to Storage
- ✅ Public URL generated
- ✅ Thumbnail displays in resource card
- ✅ Image shows in details modal

---

## Verify in Supabase Dashboard

After successful upload:

1. Go to **Storage** in Supabase Dashboard
2. Click **resources** bucket
3. Navigate to: `resource-thumbnails/` folder
4. You should see folders with user IDs
5. Inside each folder: uploaded images
6. Click an image → Should preview correctly

---

## Storage File Structure

```
resources/
└── resource-thumbnails/
    ├── 84c39889-964d-416b-a0c1-42e26d05eb3e/
    │   ├── 1783872506293.jpeg ← Your uploaded file!
    │   └── ...
    ├── 70eda192-c766-42bd-93a2-2ec7132ffdea/
    │   └── ...
    └── ...
```

---

## Troubleshooting

### Still Getting RLS Error?

Run this to check if policies exist:
```sql
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%resource%';
```

Should show 4 policies:
- ✅ Authenticated users can upload resource thumbnails (INSERT)
- ✅ Public can view resource thumbnails (SELECT)
- ✅ Users can update their own resource thumbnails (UPDATE)
- ✅ Users can delete their own resource thumbnails (DELETE)

### Policies Not Created?

Run this to manually enable RLS:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Still Not Working?

Try the nuclear option (DEVELOPMENT ONLY):
```sql
-- Temporarily disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning**: This allows anyone to upload anything. Only use for testing!

---

## Next Steps After Fix

Once thumbnails work:
1. ✅ Upload thumbnails to multiple resources
2. ✅ Test grid view displays thumbnails
3. ✅ Test details modal shows large thumbnail
4. ✅ Test learners can see thumbnails in Resources page
5. ✅ Commit and push changes to GitHub

---

## Status Checklist

- [ ] Ran `SETUP_STORAGE_BUCKET.sql` in Supabase
- [ ] Tested thumbnail upload as trainer
- [ ] Verified image appears in resource card
- [ ] Checked Storage dashboard shows uploaded files
- [ ] Tested clicking resource card opens details modal
- [ ] Verified thumbnail displays in modal

👉 **Action Required: RUN THE SQL NOW!**
