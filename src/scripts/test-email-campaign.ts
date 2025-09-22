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
  console.log('Get your API key from: https://resend.com/api-keys');
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

    console.log(`   ✅ Email sent successfully (ID: ${data?.id})`);
    console.log(`   📧 Preview: https://resend.com/emails/${data?.id}\n`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Failed to send email: ${error instanceof Error ? error.message : String(error)}\n`);
    return false;
  }
}

async function testEmailCampaign() {
  try {
    console.log('🧪 === TESTING EMAIL CAMPAIGN ===');
    console.log('📬 Starting test claim email campaign with Resend + React Email...\n');
    
    // Read the dummy user seeding results
    const jsonData = await fs.readFile('./user-seeding-results-test.json', 'utf-8');
    const seedingResults: SeedingResults = JSON.parse(jsonData);
    
    console.log(`📊 Found ${seedingResults.createdUsers.length} test users to send claim emails\n`);
    
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
    
    // Send emails one by one with delay to test the full loop
    for (let i = 0; i < seedingResults.createdUsers.length; i++) {
      const user = seedingResults.createdUsers[i];
      
      try {
        console.log(`📤 Processing ${i + 1}/${seedingResults.createdUsers.length}:`);
        const success = await sendClaimEmail(user);
        
        emailResults.push({
          user,
          success,
        });
        
        // Wait 2 seconds between emails to see the full flow
        if (i < seedingResults.createdUsers.length - 1) {
          console.log('⏳ Waiting 2 seconds...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
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
    
    // Save test email campaign results
    const campaignResults = {
      summary: {
        totalEmails: emailResults.length,
        successful,
        failed,
        sentAt: new Date().toISOString(),
        service: 'resend',
        testMode: true,
      },
      results: emailResults,
    };
    
    await fs.writeFile('./test-claim-email-results.json', JSON.stringify(campaignResults, null, 2));
    
    console.log('🎉 === TEST EMAIL CAMPAIGN COMPLETE ===');
    console.log(`📧 Emails sent: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📄 Results saved to: ./test-claim-email-results.json\n`);
    
    if (successful > 0) {
      console.log('✅ === SUCCESSFUL TEST EMAILS ===');
      emailResults
        .filter(r => r.success)
        .forEach((result, index) => {
          console.log(`${index + 1}. ${result.user.name} (${result.user.email})`);
          const claimUrl = `${process.env.NEXTAUTH_URL || 'https://rize.so'}/claim-profile?token=${result.user.claimToken}&resumeId=${result.user.resumeFileId}`;
          console.log(`   🔗 ${claimUrl}\n`);
        });
      
      console.log('💡 === TESTING TIPS ===');
      console.log('• Check your email inbox for the test emails');
      console.log('• Update emails in user-seeding-results-test.json to your actual email');
      console.log('• Use email+tag@gmail.com format to test multiple users with one inbox');
      console.log('• Visit the Resend dashboard to see email analytics');
      console.log('• The claim URLs contain test tokens and won\'t work with real database\n');
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
🧪 Test Claim Profile Email Campaign Script

This script tests the full email campaign flow using dummy data and Resend's test domain.

Usage:
  bun run src/scripts/test-email-campaign.ts

Setup:
  1. Get Resend API key from: https://resend.com/api-keys
  2. Add RESEND_API_KEY to your .env.local file
  3. Update emails in user-seeding-results-test.json to your email
  4. Run the script and check your inbox!

Features:
  - Tests the complete email campaign loop
  - Uses Resend's test domain (no domain verification needed)
  - Beautiful React email templates with your logo
  - Generates test claim URLs
  - Saves campaign results for analysis
  - Email+tag@gmail.com format for testing multiple users

Example email formats for testing:
  - your-email+alice@gmail.com
  - your-email+bob@gmail.com  
  - your-email+carol@gmail.com

All emails will arrive in your-email@gmail.com inbox with different subject tags!
`);
  process.exit(0);
}

// Run the test email campaign
testEmailCampaign().catch(console.error);