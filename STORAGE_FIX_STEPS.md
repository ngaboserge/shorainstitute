# 🔧 STORAGE FIX - Step by Step Guide

## The Problem
You got this error when running the SQL:
```
Error: must be owner of table objects
```

This is normal - Supabase doesn't let you modify storage tables directly. We need to use the Dashboard instead.

---

## ✅ SOLUTION - Follow These Steps

### Step 1: Check if Bucket Exists

1. Go to: https://app.supabase.com
2. Select your project
3. Click **Storage** in left sidebar
4. Look for a bucket called **`resources`**

**If the bucket EXISTS:**
- Note if it says "Public" or "Private"
- Continue to Step 2

**If the bucket DOESN'T EXIST:**
- Click **"New bucket"**
- Name: `resources`
- Toggle **Public bucket: ON**
- Click **"Create bucket"**
- Continue to Step 2

---

### Step 2: Make Sure Bucket is Public

1. In **Storage** page, find the `resources` bucket
2. Click the **3 dots (•••)** menu on the right
3. Click **"Edit bucket"**
4. Make sure **Public bucket** toggle is **ON** (enabled)
5. Click **"Save"**

---

### Step 3: Set Up Storage Policies Using SQL

Now run the simplified SQL script:

1. Go to **SQL Editor** in left sidebar
2. Click **"New Query"**
3. Copy **ALL** content from `SIMPLE_STORAGE_FIX.sql`
4. Paste into the editor
5. Click **"Run"** or press Ctrl+Enter

**Expected Result:**
```
Success. No rows returned
```

✅ If you see this, policies are created!

---

### Step 4: Verify Policies Were Created

Still in SQL Editor, run this query:

```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%resource%'
ORDER BY policyname;
```

**You should see 4 policies:**
1. `Authenticated users can upload resource thumbnails` (INSERT)
2. `Public can view resource thumbnails` (SELECT)
3. `Users can update their own resource thumbnails` (UPDATE)
4. `Users can delete their own resource thumbnails` (DELETE)

✅ If you see all 4, you're good!

---

### Step 5: Test Thumbnail Upload

1. Go back to your app: http://localhost:3001
2. Make sure you're logged in as trainer
3. Go to **Manage Resources**
4. Click **"Create Resource"** or edit an existing one
5. Click **"Upload Image"** under Thumbnail
6. Select an image file (JPG, PNG, max 5MB)
7. You should see a preview
8. Fill in other required fields
9. Click **"Create Resource"** or **"Update Resource"**

**Expected Result:**
- ✅ No error!
- ✅ Resource created/updated successfully
- ✅ Thumbnail shows in the resource card
- ✅ Clicking the card shows details modal with large thumbnail

---

### Step 6: Verify File in Storage

After successful upload:

1. Go to **Storage** > **resources** bucket in Supabase
2. You should see a folder: `resource-thumbnails/`
3. Click to open it
4. You should see folders with user IDs
5. Click a user ID folder
6. You should see your uploaded image files!
7. Click an image to preview it

---

## 🎯 Quick Reference

### What Each Policy Does

**1. Upload Policy (INSERT)**
- Allows any logged-in user to upload files to `resources` bucket
- No restrictions on folder structure (permissive for development)

**2. View Policy (SELECT)**
- Allows ANYONE (even not logged in) to view files
- Needed so learners can see thumbnails

**3. Update Policy (UPDATE)**
- Allows logged-in users to replace existing files
- Useful for changing thumbnails

**4. Delete Policy (DELETE)**
- Allows logged-in users to delete files
- Used when deleting resources

---

## 🐛 Troubleshooting

### Problem: SQL Script Fails

**Error: "policy already exists"**

Solution: The policies are already there! Just test uploading.

**Error: "must be owner of table objects"**

Solution: Remove the `ALTER TABLE` and `GRANT` lines from the SQL. Use `SIMPLE_STORAGE_FIX.sql` instead.

---

### Problem: Upload Still Fails

**Error: "new row violates row-level security policy"**

Solutions to try in order:

**1. Check bucket is public:**
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'resources';
```
Should show: `public = true`

**2. Check policies exist:**
```sql
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%resource%';
```
Should show 4 policies.

**3. Check if RLS is causing issues:**

Go to Supabase Dashboard → Storage → resources bucket → Policies tab

You should see the 4 policies listed there.

**4. Nuclear option (TESTING ONLY):**

If nothing works, temporarily disable RLS on storage:

```sql
-- WARNING: Only for development testing!
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

This removes all restrictions. Upload should work immediately.

---

### Problem: Image Uploads But Doesn't Display

**Check 1: Verify URL**
```sql
SELECT id, title, thumbnail_url FROM resources WHERE thumbnail_url IS NOT NULL LIMIT 5;
```

URLs should look like:
```
https://ydldtedpcnpoeznhgsot.supabase.co/storage/v1/object/public/resources/resource-thumbnails/USER-ID/TIMESTAMP.jpg
```

**Check 2: Test URL directly**
Copy a thumbnail_url and paste in browser. Should display the image.

**Check 3: Check browser console**
Open DevTools (F12) → Console tab
Look for errors when loading thumbnails.

**Common issues:**
- 404 = File doesn't exist in storage
- 403 = Permission denied (bucket not public or SELECT policy missing)
- CORS error = Supabase config issue (rare)

---

### Problem: Wrong Folder Structure

Files should be organized like this:
```
resources/
└── resource-thumbnails/
    └── 84c39889-964d-416b-a0c1-42e26d05eb3e/
        ├── 1783872506293.jpeg
        └── 1783872789456.png
```

If files are in wrong location, check the upload code:
```javascript
const filePath = `resource-thumbnails/${user.id}/${Date.now()}.${fileExt}`
```

---

## 📋 Final Checklist

Before moving on, verify:

- [ ] `resources` bucket exists in Storage
- [ ] Bucket is marked as **Public**
- [ ] 4 storage policies exist (run verification query)
- [ ] Can upload thumbnail as trainer (no errors)
- [ ] Uploaded file appears in Storage dashboard
- [ ] Thumbnail displays in resource card (grid view)
- [ ] Clicking card shows details modal with thumbnail
- [ ] Thumbnail URL is saved in database

---

## 🚀 What's Next

Once thumbnails work:

1. ✅ Test editing existing resources
2. ✅ Test uploading different image formats (JPG, PNG, WebP)
3. ✅ Test file size limit (try > 5MB, should reject)
4. ✅ Verify learners can see thumbnails in Resources page
5. ✅ Test alternative URL input method
6. ✅ Commit and push changes

---

## 💡 Tips

**Best Practices:**
- Use JPG for photos (smaller file size)
- Use PNG for graphics/logos (transparency support)
- Recommended size: 800x600px or 1200x800px
- Compress images before upload (use TinyPNG.com)
- Keep file sizes under 500KB for fast loading

**Image Optimization:**
```javascript
// Future enhancement: Add image compression before upload
// Libraries: browser-image-compression, compressorjs
```

---

## Need Help?

If you're still stuck after trying everything:

1. Share the exact error message from console
2. Share screenshot of Storage → resources bucket
3. Share result of policy verification query
4. Check if user is actually authenticated (user.id exists)

---

**Current Status:** 🔴 Waiting for you to run the SQL

**Next Action:** 👉 Run `SIMPLE_STORAGE_FIX.sql` in Supabase SQL Editor
