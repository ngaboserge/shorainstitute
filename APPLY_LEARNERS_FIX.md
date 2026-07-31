# Apply Learners Fix

## What This Does
Creates a database function that automatically fetches real user names and emails from the `auth.users` table when loading learners. This means you don't need to manually populate data - it happens automatically every time!

## How to Apply

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot
   - Click on "SQL Editor" in the left sidebar

2. **Run the Migration**
   - Click "New Query"
   - Copy the contents of `migrations/20260730000004_create_learners_view.sql`
   - Paste into the SQL Editor
   - Click "Run" button

3. **Refresh Your App**
   - Go back to http://localhost:3000
   - Navigate to the Learners page
   - The real names and emails should now appear!

## What the Function Does

The function `get_institution_learners_full()`:
- Joins `institution_learners` with `auth.users` 
- Fetches real names from `raw_user_meta_data->>'full_name'`
- Fetches real emails from `auth.users.email`
- Gets department names
- Calculates enrollment counts and average progress
- Returns everything in one query

This means:
- ✅ No manual data population needed
- ✅ Always shows current user data
- ✅ Works automatically for new learners
- ✅ No extra maintenance required
