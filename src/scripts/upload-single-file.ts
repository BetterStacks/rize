#!/usr/bin/env bun
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get filename from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: bun run upload-single-file.ts <file-path>');
  process.exit(1);
}

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary environment variables in .env.local:');
  console.error('   CLOUDINARY_CLOUD_NAME');
  console.error('   CLOUDINARY_API_KEY');
  console.error('   CLOUDINARY_API_SECRET');
  process.exit(1);
}

function extractNameAndEmail(text: string): { name: string | null; email: string | null } {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : null;

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let name: string | null = null;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 50 && 
        (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) || /^[A-Z]+ [A-Z]+/.test(line)) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum') &&
        !line.toLowerCase().includes('cv') &&
        !line.toLowerCase().includes('education') &&
        !line.toLowerCase().includes('experience') &&
        !line.toLowerCase().includes('university') &&
        !line.toLowerCase().includes('institute') &&
        !line.toLowerCase().includes('college') &&
        !line.includes('@') &&
        !line.includes('phone') &&
        !line.includes('email')) {
      name = line;
      break;
    }
  }

  return { name, email };
}

function extractTextFromPDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('pdftotext', [filePath, '-']);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`pdftotext failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function uploadSingleFile() {
  try {
    const filename = path.basename(filePath);
    console.log(`Processing: ${filename}`);

    // Extract text and name/email
    const extractedText = await extractTextFromPDF(filePath);
    const { name, email } = extractNameAndEmail(extractedText);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'resumes',
      public_id: `resume_${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`,
      use_filename: false,
    });

    const result = {
      originalFilename: filename,
      cloudinaryFileId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.secure_url,
      extractedName: name,
      extractedEmail: email,
      extractedText: extractedText.substring(0, 500),
      uploadedAt: new Date().toISOString(),
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('ERROR:', error instanceof Error ? error.message : JSON.stringify(error));
    process.exit(1);
  }
}

uploadSingleFile();