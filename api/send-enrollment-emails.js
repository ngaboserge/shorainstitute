/**
 * Serverless Function: Send Enrollment Email Notifications
 * POST /api/send-enrollment-emails
 * 
 * This function processes queued enrollment emails and sends notifications
 * to specified recipients when learners enroll in courses.
 * 
 * Can be triggered by:
 * 1. Cron job (every 5 minutes)
 * 2. Manual trigger
 * 3. Webhook from Supabase
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// SMTP Configuration for cPanel email
const SMTP_HOST = process.env.SMTP_HOST || 'mail.shorainstitute.com';
const SMTP_PORT = process.env.SMTP_PORT || 465; // 465 for SSL, 587 for TLS
const SMTP_USER = process.env.SMTP_USER; // e.g., info@shorainstitute.com
const SMTP_PASS = process.env.SMTP_PASS; // Your email password
const FROM_EMAIL = process.env.SMTP_USER || 'Shora Institute <info@shorainstitute.com>';

// Initialize Supabase client with service role
function getSupabaseAdmin() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        return null;
    }
    
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Create SMTP transporter
function createMailTransporter() {
    if (!SMTP_USER || !SMTP_PASS) {
        console.error('Missing SMTP credentials');
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        },
        tls: {
            // Do not fail on invalid certificates (useful for self-signed certs)
            rejectUnauthorized: false
        }
    });
}

// Send email using cPanel SMTP
async function sendEmail(to, subject, html) {
    const transporter = createMailTransporter();
    
    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: subject,
            html: html
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

// Generate HTML email template
function generateEnrollmentEmailHTML(data) {
    const { course_title, learner_name, learner_email, amount_paid, payment_method, course_id } = data;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Course Enrollment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎓 New Student Enrolled!</h1>
                    <p style="color: #e3f2fd; margin: 8px 0 0; font-size: 14px;">A learner has successfully enrolled in your course</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px; background: #f9fafb;">
                    <!-- Course Details -->
                    <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px; display: flex; align-items: center;">
                            📚 Course Details
                        </h2>
                        <div style="padding: 12px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #0B4F9F;">
                            <p style="font-size: 16px; font-weight: 600; color: #0B4F9F; margin: 0;">${course_title || 'Course Name'}</p>
                        </div>
                    </div>
                    
                    <!-- Student Information -->
                    <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px;">👤 Student Information</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name:</td>
                                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${learner_name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${learner_email || 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Payment Details -->
                    <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 24px;">
                        <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px;">💳 Payment Details</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Amount:</td>
                                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">$${amount_paid || '0.00'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Method:</td>
                                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${payment_method || 'Online Payment'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
                                <td style="padding: 8px 0;">
                                    <span style="background: #dcfce7; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">✓ PAID</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center;">
                        <a href="https://www.shorainstitute.com/trainer/courses/${course_id}/students" 
                           style="display: inline-block; background: #0B4F9F; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(11, 79, 159, 0.2);">
                            View All Students →
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #1a1a1a; padding: 30px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0; font-size: 14px; font-weight: 600;">Shora Institute</p>
                    <p style="color: #6b7280; margin: 8px 0 0; font-size: 12px;">Empowering Minds. Building Wealth.</p>
                    <div style="margin-top: 16px;">
                        <a href="https://www.shorainstitute.com" style="color: #0B4F9F; text-decoration: none; font-size: 13px; font-weight: 600;">
                            www.shorainstitute.com
                        </a>
                    </div>
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #374151;">
                        <a href="https://instagram.com/shorainstitute" style="color: #6b7280; text-decoration: none; margin: 0 8px; font-size: 12px;">Instagram</a>
                        <span style="color: #374151;">•</span>
                        <a href="https://linkedin.com/company/shorainstitute" style="color: #6b7280; text-decoration: none; margin: 0 8px; font-size: 12px;">LinkedIn</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Main handler
export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Simple authentication
    const authHeader = req.headers['authorization'];
    const expectedToken = process.env.EMAIL_CRON_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return res.status(500).json({ success: false, error: 'Database unavailable' });
    }

    try {
        // Fetch pending emails (not sent yet)
        const { data: pendingEmails, error: fetchError } = await supabase
            .from('enrollment_email_queue')
            .select('*')
            .eq('email_sent', false)
            .order('created_at', { ascending: true })
            .limit(10); // Process 10 at a time

        if (fetchError) {
            throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
        }

        if (!pendingEmails || pendingEmails.length === 0) {
            return res.status(200).json({ 
                success: true, 
                processed: 0,
                message: 'No pending emails to send' 
            });
        }

        const results = [];

        // Process each email
        for (const emailData of pendingEmails) {
            const subject = `🎓 New Course Enrollment - ${emailData.course_title}`;
            const html = generateEnrollmentEmailHTML(emailData);

            // Send email to all recipients
            const emailResult = await sendEmail(
                emailData.recipient_emails,
                subject,
                html
            );

            // Mark as sent (or failed)
            const { error: updateError } = await supabase
                .from('enrollment_email_queue')
                .update({
                    email_sent: emailResult.success,
                    sent_at: new Date().toISOString(),
                    error_message: emailResult.success ? null : emailResult.error
                })
                .eq('id', emailData.id);

            results.push({
                id: emailData.id,
                course: emailData.course_title,
                success: emailResult.success,
                error: emailResult.error || null
            });
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        return res.status(200).json({
            success: true,
            processed: results.length,
            successCount,
            failureCount,
            results
        });

    } catch (error) {
        console.error('Email processing error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
