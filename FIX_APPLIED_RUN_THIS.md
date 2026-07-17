# ✅ FIXED: Revenue Sharing Schema Updated

## What Was Wrong
The SQL script was trying to add columns to a `profiles` table that doesn't exist.

## What Was Fixed
Updated the SQL script to use the correct table: `users` (not `profiles`)

## What Changed

### Files Updated:
1. ✅ `ADD_REVENUE_SHARING_SCHEMA.sql` - Now uses `users` table
2. ✅ `src/components/RevenueSettingsSection.jsx` - Now saves to `users` table

## Run This SQL Now

Open Supabase SQL Editor and run `ADD_REVENUE_SHARING_SCHEMA.sql`

The script will:
- Add 9 new columns to the `users` table for revenue settings
- Create `revenue_splits` table to track payments
- Create `calculate_revenue_split()` function

## After Running SQL

1. Refresh your app
2. Login as trainer: draderemibanjoko@gmail.com
3. Go to Profile page
4. Scroll to "Revenue Sharing & Payout Settings"
5. Click Edit and configure your settings

## Column Details Added to `users` Table

- `commission_type` - 'percentage' or 'fixed'
- `commission_value` - % or $ amount
- `payout_method` - 'bank_transfer', 'mobile_money', or 'paypal'
- `bank_account_name` - for bank transfer
- `bank_account_number` - for bank transfer
- `bank_name` - for bank transfer
- `mobile_money_number` - for mobile money
- `mobile_money_provider` - 'mtn', 'airtel', etc.
- `paypal_email` - for PayPal

All columns are optional and have defaults:
- Default commission_type: 'percentage'
- Default commission_value: 70 (trainer gets 70%)
- Default payout_method: 'bank_transfer'

The SQL is safe to run - it uses `IF NOT EXISTS` so it won't break if run multiple times.
