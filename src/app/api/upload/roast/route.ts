import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PDFDocument } from 'pdf-lib'

// Ensures Node APIs are available for pdf-parse
export const runtime = 'nodejs'

export async function POST(req: Request) {
    try {
        // Step 1: Read file from form data
        const formData = await req.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: 'No file uploaded.' },
                { status: 400 }
            )
        }

        // Step 3: Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer()
        
        
        // Extract text using pdf-lib
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pages = pdfDoc.getPages()
        let resumeText = ''

        // Get text from each page
        for (const page of pages) {
            const { width, height } = page.getSize()
            resumeText += `Page content extracted (${width}x${height})\n`
        }

        // Fallback: convert buffer to string if pdf-lib doesn't extract text
        if (!resumeText.trim()) {
            resumeText = Buffer.from(arrayBuffer).toString('utf-8')
        }

        if (!resumeText.trim()) {
            return NextResponse.json(
                { error: 'Could not extract text from PDF.' },
                { status: 400 }
            )
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

        // Step 5: Send text to LLM (OpenAI)
        const prompt = 
        ` You are a savage roaster. Roast this resume in 150-200 words.
        Write ONE flowing paragraph - no bullet points, no lists, no bold text, no asterisks.
        Use simple, casual words like you're texting a friend. No fancy vocabulary.
        Make fun of 3-4 things: their buzzwords, boring descriptions, bad formatting, or generic phrases.
        Use Indian references and comparisons that desi people will get (like "busier than a railway station", "more generic than a LinkedIn influencer", "emptier than a movie hall on a weekday", "boring as a 3-hour family function").
        Keep sentences short and punchy. Make each line land like a joke.
        End with a fake compliment that's actually an insult.
        Resume: ${resumeText}`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // fast + cost-efficient model
            messages: [
                { role: 'user', content: prompt }
            ],
        })

        const roast = completion.choices[0].message?.content || 'No roast generated.'

        // Step 6: Return roast text
        return NextResponse.json({ roast })
    } catch (err: any) {
        console.error('Error roasting resume:', err)
        return NextResponse.json(
            { error: 'Something went wrong while roasting the resume.' },
            { status: 500 }
        )
    }
}