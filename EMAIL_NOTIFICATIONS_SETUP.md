# Email Notifications Setup Guide

This guide explains how to set up email notifications for course enrollments.

## Overview

When a learner pays for and enrolls in a course, email notifications are automatically sent to:
- `aderemibanjoko@yahoo.co.uk`
- `info@shorainstitute.com`

## Setup Steps

### 1. Run Database Migrations

Execute these SQL migrations in your Supabase SQL Editor:

```bash
# In order:
1. migrations/20260819000002_create_notifications_system.sql
2. migrations/20260819000003_email_notifications_on_enrollment.sql
```

This creates:
- `notifications` table (in-app notifications for trainers)
- `notification_email_recipients` table (email addresses to notify)
- `enrollment_email_queue` table (queue for sending emails)
- Automatic triggers that queue emails when enrollments are approved

### 2. Set Up Resend Email Service

1. Go to [Resend.com](https://resend.com) and create a free account
2. Verify your sending domain (or use their test domain for development)
3. Generate an API key from: https://resend.com/api-keys
4. Add to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_CRON_SECRET=your_random_secret_here_xyz123
```

### 3. Configure Email Recipients

The migration automatically adds these email addresses:
- `aderemibanjoko@yahoo.co.uk`
- `info@shorainstitute.com`

To add/remove recipients, update the `notification_email_recipients` table:

```sql
-- Add a new recipient
INSERT INTO notification_email_recipients (email, notification_type, is_active)
VALUES ('newemail@example.com', 'all', TRUE);

-- Disable a recipient (without deleting)
UPDATE notification_email_recipients 
SET is_active = FALSE 
WHERE email = 'old@example.com';

-- Remove a recipient
DELETE FROM notification_email_recipients 
WHERE email = 'old@example.com';
```

### 4. Deploy the Email Sender API

The email sender is at: `/api/send-enrollment-emails.js`

**Vercel Deployment:**
- The API will be automatically deployed with your app
- URL will be: `https://www.shorainstitute.com/api/send-enrollment-emails`

### 5. Set Up Automated Email Sending

You have two options:

#### Option A: Vercel Cron Jobs (Recommended)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/send-enrollment-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes and processes pending emails.

#### Option B: External Cron Service

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create a cron job
2. URL: `https://www.shorainstitute.com/api/send-enrollment-emails`
3. Method: POST
4. Headers: `Authorization: Bearer YOUR_EMAIL_CRON_SECRET`
5. Schedule: Every 5 minutes (`*/5 * * * *`)

### 6. Test the System

#### Test Email Queue:

```sql
-- Check pending emails
SELECT * FROM enrollment_email_queue WHERE email_sent = FALSE;

-- Check sent emails
SELECT * FROM enrollment_email_queue WHERE email_sent = TRUE ORDER BY sent_at DESC;
```

#### Manual Trigger:

Send a POST request to test:

```bash
curl -X POST https://www.shorainstitute.com/api/send-enrollment-emails \
  -H "Authorization: Bearer YOUR_EMAIL_CRON_SECRET"
```

#### Create Test Enrollment:

The easiest way is to make a real test payment on your site. The system will:
1. Detect payment approval
2. Queue an email in `enrollment_email_queue`
3. Send email on next cron run (within 5 minutes)

## Email Template

The email includes:
- Professional Shora Institute branding
- Course title
- Student name and email
- Payment amount and method
- Payment status (PAID)
- Direct link to view all students
- Social media links

## Monitoring

### Check In-App Notifications:
- Login as trainer
- Click bell icon in header
- See real-time notifications

### Check Email Queue:

```sql
-- View pending emails
SELECT * FROM pending_enrollment_emails;

-- View failed emails
SELECT * FROM enrollment_email_queue 
WHERE email_sent = FALSE 
  AND error_message IS NOT NULL;

-- Count emails sent today
SELECT COUNT(*) 
FROM enrollment_email_queue 
WHERE email_sent = TRUE 
  AND sent_at >= CURRENT_DATE;
```

## Troubleshooting

### Emails Not Sending:

1. **Check queue:**
   ```sql
   SELECT * FROM enrollment_email_queue WHERE email_sent = FALSE;
   ```

2. **Verify Resend API key** in `.env`

3. **Check cron job is running** (logs in Vercel dashboard or cron service)

4. **Test API endpoint manually** with curl command above

### Emails Going to Spam:

1. Verify your sending domain in Resend
2. Add SPF, DKIM, and DMARC records to your DNS
3. Use Resend's domain verification guide

### Wrong Recipients:

Check the `notification_email_recipients` table:

```sql
SELECT * FROM notification_email_recipients WHERE is_active = TRUE;
```

## Cost Considerations

**Resend Free Tier:**
- 3,000 emails/month free
- Perfect for most course platforms
- Upgrade if you need more

**Vercel Cron:**
- Free on Pro plan
- Consider serverless function execution limits

## Security

- Never expose `RESEND_API_KEY` in frontend code
- Keep `EMAIL_CRON_SECRET` private
- Only service role can access email queue tables
- RLS policies protect all data

## Support

If you need help:
1. Check Supabase logs for database errors
2. Check Vercel logs for API errors
3. Test with manual API calls
4. Verify environment variables are set correctly
