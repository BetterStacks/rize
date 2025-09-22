#!/usr/bin/env bun
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

interface ResumeData {
  originalFilename: string;
  cloudinaryFileId: string;
  cloudinaryUrl: string;
  extractedName: string | null;
  extractedEmail: string | null;
  extractedText: string;
  uploadedAt: string;
}

function runUploadCommand(filePath: string): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const child = spawn('bun', ['run', 'src/scripts/upload-single-file.ts', filePath]);
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
        try {
          // Extract JSON result from stdout
          const lines = stdout.trim().split('\n');
          const jsonStart = lines.findIndex(line => line.trim().startsWith('{'));
          if (jsonStart >= 0) {
            const jsonStr = lines.slice(jsonStart).join('\n');
            const result = JSON.parse(jsonStr);
            resolve(result);
          } else {
            reject(new Error('No JSON result found in output'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse result: ${error}`));
        }
      } else {
        reject(new Error(`Upload failed: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function processAllResumes() {
  const resumesFolder = '/Users/sourabhrathour/desktop/resumes';
  const outputFile = './resume-upload-results.json';

  try {
    await fs.access(resumesFolder);
    const files = await fs.readdir(resumesFolder);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    console.log(`🔍 Found ${pdfFiles.length} PDF files to process\n`);

    const results: ResumeData[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const filePath = path.join(resumesFolder, file);
      
      try {
        console.log(`📄 Processing ${i + 1}/${pdfFiles.length}: ${file}`);
        const result = await runUploadCommand(filePath);
        results.push(result);
        
        console.log(`   ✅ Success - Name: ${result.extractedName || 'Not found'}, Email: ${result.extractedEmail || 'Not found'}`);
        console.log(`   🔗 Cloudinary ID: ${result.cloudinaryFileId}`);
        
        // Wait 2 seconds between uploads
        if (i < pdfFiles.length - 1) {
          console.log(`   ⏳ Waiting 2 seconds...\n`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Failed: ${errorMsg}\n`);
        errors.push({
          filename: file,
          error: errorMsg
        });
      }
    }

    const output = {
      summary: {
        totalFiles: pdfFiles.length,
        successful: results.length,
        failed: errors.length,
        processedAt: new Date().toISOString()
      },
      results,
      errors
    };

    await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
    
    console.log('\n🎉 === UPLOAD COMPLETE ===');
    console.log(`✅ Successfully uploaded: ${results.length}`);
    console.log(`❌ Failed: ${errors.length}`);
    console.log(`📄 Results saved to: ${outputFile}\n`);
    
    if (results.length > 0) {
      console.log('📋 === FINAL RESULTS ===');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.originalFilename}`);
        console.log(`   Name: ${result.extractedName || 'Not found'}`);
        console.log(`   Email: ${result.extractedEmail || 'Not found'}`);
        console.log(`   Cloudinary ID: ${result.cloudinaryFileId}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

processAllResumes().catch(console.error);