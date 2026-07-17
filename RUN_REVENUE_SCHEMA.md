# Quick Guide: Add Revenue Sharing to Database

## Step 1: Run SQL Migration

1. Go to Supabase Dashboard: https://ydldtedpcnpoeznhgsot.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `ADD_REVENUE_SHARING_SCHEMA.sql` from this project
5. Copy all the SQL content
6. Paste it into the Supabase SQL Editor
7. Click **RUN** button

You should see: `Revenue sharing schema created successfully!`

## Step 2: Test the Feature

1. Make sure dev server is running: `npm run dev`
2. Login as trainer: **draderemibanjoko@gmail.com**
3. Navigate to **Profile** page
4. Scroll down to find **"Revenue Sharing & Payout Settings"** section
5. Click **Edit** button
6. Test the features:
   - Toggle between "Percentage Split" and "Fixed Platform Fee"
   - Enter a commission value and watch the example calculation update
   - Select a payout method (Bank Transfer/Mobile Money/PayPal)
   - Fill in the payout details
   - Click "Save Payout Settings"
7. Refresh the page and verify settings are saved

## What Was Added

### Database Changes
- 9 new columns in `profiles` table for commission and payout settings
- New `revenue_splits` table to track actual revenue splits per payment
- SQL function `calculate_revenue_split()` for computing splits

### UI Changes
- New section in trainer profile: "Revenue Sharing & Payout Settings"
- Commission structure settings (percentage or fixed fee)
- Live example showing how a $500 course would be split
- Payout method configuration (bank/mobile money/PayPal)
- Form fields for entering account details

## Revenue Models

### Option 1: Percentage Split
- You set your percentage (e.g., 70%)
- For a $500 course: You get $350, Platform gets $150

### Option 2: Fixed Platform Fee
- Platform takes a fixed amount (e.g., $50)
- For a $500 course: You get $450, Platform gets $50

## Payout Methods

1. **Bank Transfer**: Enter account name, number, and bank name
2. **Mobile Money**: Select provider (MTN/Airtel) and enter mobile number
3. **PayPal**: Enter your PayPal email address

## Next Steps (For Later)

After testing, the next phase is to:
1. Integrate revenue split calculation into payment approval flow
2. Automatically create `revenue_splits` records when payments are approved
3. Display revenue breakdown in Payment Approvals page
4. Create a "My Earnings" or "Payouts" page for trainers
5. Add monthly payout processing

## Default Settings

If you haven't configured revenue settings yet:
- Commission Type: Percentage Split
- Your Percentage: 70%
- Payout Method: Bank Transfer (not configured)

All trainers start with these defaults.
