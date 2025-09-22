#!/usr/bin/env bun
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { ClaimProfileEmail } from '../components/emails/claim-profile-email';

// Load environment variables
dotenv.config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment variables');
  console.log('Please add RESEND_API_KEY to your .env.local file');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

interface CreatedUser {
  id: string;
  name: string;
  email: string;
  claimToken: string;
  resumeFileId: string;
  originalFilename: string;
  cloudinaryUrl: string;
}

interface SeedingResults {
  summary: {
    totalResumes: number;
    usersCreated: number;
    errors: number;
    seededAt: string;
  };
  createdUsers: CreatedUser[];
  errors: any[];
}

async function sendClaimEmail(user: CreatedUser): Promise<boolean> {
  try {
    const claimUrl = `${process.env.NEXTAUTH_URL || 'https://rize.so'}/claim-profile?token=${user.claimToken}&resumeId=${user.resumeFileId}`;
    
    console.log(`📧 Sending claim email to: ${user.name} (${user.email})`);
    console.log(`🔗 Claim URL: ${claimUrl}`);
    
    // Render the React email template
    const emailHtml = await render(ClaimProfileEmail({
      name: user.name,
      claimUrl: claimUrl,
      resumeFilename: user.originalFilename,
    }));

    // Send email using Resend (using test domain for development)
    const { data, error } = await resend.emails.send({
      from: 'Rize <grow@rize.so>',
      to: [user.email],
      subject: `Welcome to Rize, ${user.name}! Claim your profile`,
      html: emailHtml,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log(`   ✅ Email sent successfully (ID: ${data?.id})\n`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Failed to send email: ${error instanceof Error ? error.message : String(error)}\n`);
    return false;
  }
}

async function sendClaimEmails() {
  try {
    console.log('📬 Starting claim email campaign with Resend + React Email...\n');
    
    // Read the user seeding results
    const jsonData = await fs.readFile('./user-seeding-results.json', 'utf-8');
    const seedingResults: SeedingResults = JSON.parse(jsonData);
    
    console.log(`📊 Found ${seedingResults.createdUsers.length} users to send claim emails\n`);
    
    if (seedingResults.createdUsers.length === 0) {
      console.log('❌ No users found to send emails to');
      return;
    }
    
    const emailResults: Array<{
      user: CreatedUser;
      success: boolean;
      error?: string;
      emailId?: string;
    }> = [];
    
    // Send emails one by one with delay to avoid rate limits
    for (let i = 0; i < seedingResults.createdUsers.length; i++) {
      const user = seedingResults.createdUsers[i];
      
      try {
        console.log(`📤 Processing ${i + 1}/${seedingResults.createdUsers.length}:`);
        const success = await sendClaimEmail(user);
        
        emailResults.push({
          user,
          success,
        });
        
        // Wait 1 second between emails (Resend has good rate limits)
        if (i < seedingResults.createdUsers.length - 1) {
          console.log('⏳ Waiting 1 second...\n');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error processing ${user.email}: ${errorMsg}\n`);
        
        emailResults.push({
          user,
          success: false,
          error: errorMsg,
        });
      }
    }
    
    // Calculate summary
    const successful = emailResults.filter(r => r.success).length;
    const failed = emailResults.filter(r => !r.success).length;
    
    // Save email campaign results
    const campaignResults = {
      summary: {
        totalEmails: emailResults.length,
        successful,
        failed,
        sentAt: new Date().toISOString(),
        service: 'resend',
      },
      results: emailResults,
    };
    
    await fs.writeFile('./claim-email-results.json', JSON.stringify(campaignResults, null, 2));
    
    console.log('🎉 === EMAIL CAMPAIGN COMPLETE ===');
    console.log(`📧 Emails sent: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📄 Results saved to: ./claim-email-results.json\n`);
    
    if (successful > 0) {
      console.log('✅ === SUCCESSFUL EMAILS ===');
      emailResults
        .filter(r => r.success)
        .forEach((result, index) => {
          console.log(`${index + 1}. ${result.user.name} (${result.user.email})`);
          const claimUrl = `${process.env.NEXTAUTH_URL || 'https://rize.so'}/claim-profile?token=${result.user.claimToken}&resumeId=${result.user.resumeFileId}`;
          console.log(`   🔗 ${claimUrl}\n`);
        });
    }
    
    if (failed > 0) {
      console.log('❌ === FAILED EMAILS ===');
      emailResults
        .filter(r => !r.success)
        .forEach((result, index) => {
          console.log(`${index + 1}. ${result.user.name} (${result.user.email})`);
          console.log(`   Error: ${result.error}\n`);
        });
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Show help if running with --help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🚀 Claim Profile Email Campaign Script (Resend + React Email)

This script sends beautiful claim profile emails using Resend and React Email templates.

Usage:
  bun run src/scripts/send-claim-emails.ts

Requirements:
  - RESEND_API_KEY environment variable
  - user-seeding-results.json file (created by seed script)
  - Verified domain in Resend (or use Resend's test domain)

The script will:
  1. Read user data from user-seeding-results.json
  2. Render beautiful React email templates
  3. Send emails via Resend API
  4. Generate claim URLs: /claim-profile?token=...&resumeId=...
  5. Save results to claim-email-results.json

Email Features:
  - Beautiful responsive design with your Rize logo
  - Personalized content with user name and resume filename
  - Clear call-to-action button
  - Fallback link for accessibility
  - Professional footer with help information

Note: Update the 'from' address to match your verified domain in Resend.
`);
  process.exit(0);
}

// Run the email campaign
sendClaimEmails().catch(console.error);