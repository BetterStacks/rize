#!/usr/bin/env bun
import fs from 'fs/promises';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool, schema: { users } });

interface ResumeData {
  originalFilename: string;
  cloudinaryFileId: string;
  cloudinaryUrl: string;
  extractedName: string | null;
  extractedEmail: string | null;
  extractedText: string;
  uploadedAt: string;
}

interface UploadResults {
  summary: {
    totalFiles: number;
    successful: number;
    failed: number;
    processedAt: string;
  };
  results: ResumeData[];
  errors: any[];
}

async function generateClaimToken(): Promise<string> {
  // Generate a secure random token for claiming
  return uuidv4();
}

async function seedUsersFromResumes() {
  try {
    console.log('🔍 Reading resume upload results...');
    
    // Read the JSON file with upload results
    const jsonData = await fs.readFile('./resume-upload-results.json', 'utf-8');
    const uploadResults: UploadResults = JSON.parse(jsonData);
    
    console.log(`📊 Found ${uploadResults.results.length} successful uploads to process`);
    
    const createdUsers: any[] = [];
    const errors: { filename: string; error: string }[] = [];
    
    // First, update existing users to have isClaimed: true
    console.log('📝 Updating existing users to have isClaimed: true...');
    await db.update(users)
      .set({ isClaimed: true })
      .where(eq(users.isClaimed, false));
    
    console.log('✅ Existing users updated\n');
    
    // Process each resume result
    for (let i = 0; i < uploadResults.results.length; i++) {
      const resume = uploadResults.results[i];
      
      try {
        console.log(`👤 Processing ${i + 1}/${uploadResults.results.length}: ${resume.originalFilename}`);
        
        // Validate required data
        if (!resume.extractedName || !resume.extractedEmail) {
          throw new Error(`Missing name or email - Name: ${resume.extractedName}, Email: ${resume.extractedEmail}`);
        }
        
        // Check if user with this email already exists
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, resume.extractedEmail))
          .limit(1);
        
        if (existingUser.length > 0) {
          console.log(`   ⚠️  User already exists with email: ${resume.extractedEmail}`);
          errors.push({
            filename: resume.originalFilename,
            error: `User already exists with email: ${resume.extractedEmail}`
          });
          continue;
        }
        
        // Generate claim token
        const claimToken = await generateClaimToken();
        
        // Create user directly in users table (same as signup form)
        // No password initially - will be set during claim process
        const newUser = await db.insert(users).values({
          id: uuidv4(),
          name: resume.extractedName,
          email: resume.extractedEmail,
          password: null, // No password until claimed
          emailVerified: false,
          image: null,
          isOnboarded: false,
          isClaimed: false, // These accounts need to be claimed
          resumeFileId: resume.cloudinaryFileId,
          claimToken: claimToken,
          letrazId: null,
        }).returning();
        
        createdUsers.push({
          ...newUser[0],
          originalFilename: resume.originalFilename,
          cloudinaryUrl: resume.cloudinaryUrl,
        });
        
        console.log(`   ✅ Created user: ${resume.extractedName} (${resume.extractedEmail})`);
        console.log(`   🔑 Claim token: ${claimToken}`);
        console.log(`   📎 Resume: ${resume.cloudinaryFileId}\n`);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Failed to create user for ${resume.originalFilename}: ${errorMsg}\n`);
        errors.push({
          filename: resume.originalFilename,
          error: errorMsg
        });
      }
    }
    
    // Save detailed results
    const seedResults = {
      summary: {
        totalResumes: uploadResults.results.length,
        usersCreated: createdUsers.length,
        errors: errors.length,
        seededAt: new Date().toISOString()
      },
      createdUsers,
      errors
    };
    
    await fs.writeFile('./user-seeding-results.json', JSON.stringify(seedResults, null, 2));
    
    console.log('🎉 === SEEDING COMPLETE ===');
    console.log(`✅ Users created: ${createdUsers.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`📄 Results saved to: ./user-seeding-results.json\n`);
    
    if (createdUsers.length > 0) {
      console.log('👥 === CREATED USERS SUMMARY ===');
      createdUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Claim Token: ${user.claimToken}`);
        console.log(`   Resume: ${user.resumeFileId}\n`);
      });
    }
    
    if (errors.length > 0) {
      console.log('❌ === ERRORS ===');
      errors.forEach(error => {
        console.log(`• ${error.filename}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding script
seedUsersFromResumes().catch(console.error);