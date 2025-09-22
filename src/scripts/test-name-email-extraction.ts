#!/usr/bin/env bun
import { spawn } from 'child_process';
import fs from 'fs/promises';

// Extract name and email from PDF text using simple regex patterns
function extractNameAndEmail(text: string): { name: string | null; email: string | null } {
  // Email regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : null;

  // Name extraction - look for lines that might be names (simple heuristic)
  // Usually names are at the beginning of resumes, in title case, 2-4 words
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let name: string | null = null;

  console.log('\n=== FIRST 15 LINES OF PDF ===');
  lines.slice(0, 15).forEach((line, index) => {
    console.log(`${index + 1}: "${line}"`);
  });

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    // Skip common header words and look for likely names
    // Updated pattern to handle both Title Case and ALL CAPS names
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
      console.log(`\n✅ DETECTED NAME: "${name}" (from line ${i + 1})`);
      break;
    }
  }

  if (!name) {
    console.log('\n❌ NO NAME DETECTED - Showing analysis:');
    lines.slice(0, 10).forEach((line, index) => {
      const checks = {
        length: line.length > 3 && line.length < 50,
        pattern: /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) || /^[A-Z]+ [A-Z]+/.test(line),
        noResume: !line.toLowerCase().includes('resume'),
        noCurriculum: !line.toLowerCase().includes('curriculum'),
        noCv: !line.toLowerCase().includes('cv'),
        noEducation: !line.toLowerCase().includes('education'),
        noExperience: !line.toLowerCase().includes('experience'),
        noUniversity: !line.toLowerCase().includes('university'),
        noInstitute: !line.toLowerCase().includes('institute'),
        noCollege: !line.toLowerCase().includes('college'),
        noAt: !line.includes('@'),
        noPhone: !line.includes('phone'),
        noEmail: !line.includes('email')
      };
      const passed = Object.values(checks).every(check => check);
      console.log(`Line ${index + 1}: "${line}" -> ${passed ? '✅ PASSES' : '❌ FAILS'}`);
      if (!passed) {
        console.log(`  Failed checks: ${Object.entries(checks).filter(([_, pass]) => !pass).map(([key]) => key).join(', ')}`);
      }
    });
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

async function testSingleResume() {
  const filePath = '/Users/sourabhrathour/desktop/resumes/AmanRai_Resume_FullStack.pdf';

  try {
    console.log(`Testing file: ${filePath}`);
    
    // Check if file exists
    await fs.access(filePath);
    
    console.log('Attempting to extract text using pdftotext...');
    
    // Extract text from PDF using pdftotext command
    const extractedText = await extractTextFromPDF(filePath);

    console.log('\n=== PDF METADATA ===');
    console.log(`Text length: ${extractedText.length} characters`);

    // Extract name and email
    const { name, email } = extractNameAndEmail(extractedText);

    console.log('\n=== EXTRACTION RESULTS ===');
    console.log(`Name: ${name || 'NOT FOUND'}`);
    console.log(`Email: ${email || 'NOT FOUND'}`);

    if (email) {
      console.log(`✅ EMAIL DETECTED: "${email}"`);
      // Find which line contains the email
      const lines = extractedText.split('\n');
      const emailLineIndex = lines.findIndex(line => line.includes(email));
      if (emailLineIndex !== -1) {
        console.log(`   Found in line ${emailLineIndex + 1}: "${lines[emailLineIndex].trim()}"`);
      }
    }

    // Show full text for manual inspection (first 1000 chars)
    console.log('\n=== FIRST 1000 CHARACTERS OF PDF TEXT ===');
    console.log(extractedText.substring(0, 1000));
    console.log('\n...');

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`❌ File not found: ${filePath}`);
      console.log('Please make sure the file exists at the specified location.');
    } else if (error.message?.includes('pdftotext')) {
      console.error('❌ pdftotext command not found. Installing poppler-utils...');
      console.log('On macOS, run: brew install poppler');
      console.log('On Ubuntu, run: sudo apt-get install poppler-utils');
      console.log('On Windows, install poppler-utils for Windows');
    } else {
      console.error('❌ Error processing file:', error);
    }
  }
}

// Run the test
testSingleResume().catch(console.error);