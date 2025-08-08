export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface UserData {
  name: string;
  email: string;
  username?: string;
  profileImage?: string;
  completionPercentage?: number;
}

export const generateWelcomeEmail = (userData: UserData): EmailTemplate => {
  const { name, username } = userData
  
  return {
    subject: 'Welcome to Rize! Let\'s build your story 🌟',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Rize</title>
  <style>
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background-color: #ffffff;
    }
    .header { 
      text-align: center; 
      padding: 40px 0; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      margin-bottom: 32px;
    }
    .logo { 
      font-size: 32px; 
      font-weight: 700; 
      color: white; 
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin-top: 8px;
      font-style: italic;
    }
    .content { 
      padding: 0 24px; 
    }
    .greeting { 
      font-size: 24px; 
      font-weight: 600; 
      margin-bottom: 16px;
      color: #1a1a1a;
    }
    .cta-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 12px; 
      font-weight: 600;
      margin: 24px 0;
      transition: transform 0.2s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .steps {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .step {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .footer { 
      text-align: center; 
      color: #666; 
      font-size: 14px; 
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }
    .social-links {
      margin: 16px 0;
    }
    .social-links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Rize</div>
    <div class="tagline">Own Your Story, Not Just Your Resume</div>
  </div>
  
  <div class="content">
    <div class="greeting">Hey ${name}! 👋</div>
    
    <p>Welcome to Rize! We're excited to help you create a professional profile that actually tells your story.</p>
    
    <p>Unlike traditional resumes, your Rize profile showcases the real you - your creative work, experiences, travels, and the journey that makes you unique.</p>
    
    <div class="steps">
      <h3 style="margin-top: 0; color: #1a1a1a;">Let's get you started in 3 minutes:</h3>
      
      <div class="step">
        <div class="step-number">1</div>
        <div>Add a compelling bio that shows your personality</div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div>Upload your first project or creative work</div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div>Connect your social links to build your network</div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/${username || 'onboarding'}" class="cta-button">
        Complete Your Profile →
      </a>
    </div>
    
    <p><strong>Pro tip:</strong> Profiles with photos and projects get 5x more views. Make yours stand out!</p>
    
    <p>Questions? Just reply to this email - we're here to help.</p>
    
    <p>Best,<br>The Rize Team</p>
  </div>
  
  <div class="footer">
    <div class="social-links">
      <a href="#">Twitter</a> | 
      <a href="#">LinkedIn</a> | 
      <a href="#">GitHub</a>
    </div>
    <p>© 2025 Rize. Own your digital identity.</p>
    <p><a href="#" style="color: #999; font-size: 12px;">Unsubscribe</a></p>
  </div>
</body>
</html>`,
    text: `
Hey ${name}! 👋

Welcome to Rize! We're excited to help you create a professional profile that actually tells your story.

Unlike traditional resumes, your Rize profile showcases the real you - your creative work, experiences, travels, and the journey that makes you unique.

Let's get you started in 3 minutes:

1. Add a compelling bio that shows your personality
2. Upload your first project or creative work  
3. Connect your social links to build your network

Complete your profile: ${process.env.NEXT_PUBLIC_APP_URL}/${username || 'onboarding'}

Pro tip: Profiles with photos and projects get 5x more views. Make yours stand out!

Questions? Just reply to this email - we're here to help.

Best,
The Rize Team

© 2025 Rize. Own your digital identity.
Unsubscribe: [link]
    `
  }
}

export const generateFollowUpEmail = (userData: UserData): EmailTemplate => {
  const { name, username, completionPercentage = 0 } = userData
  const isIncomplete = completionPercentage < 80
  
  return {
    subject: isIncomplete 
      ? `${name}, your Rize profile is ${completionPercentage}% complete ✨` 
      : 'Make your Rize profile shine! Here\'s how 🚀',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isIncomplete ? 'Complete Your Profile' : 'Make Your Profile Shine'}</title>
  <style>
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background-color: #ffffff;
    }
    .header { 
      text-align: center; 
      padding: 40px 0; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      margin-bottom: 32px;
    }
    .logo { 
      font-size: 32px; 
      font-weight: 700; 
      color: white; 
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .content { 
      padding: 0 24px; 
    }
    .greeting { 
      font-size: 24px; 
      font-weight: 600; 
      margin-bottom: 16px;
      color: #1a1a1a;
    }
    .progress-bar {
      background-color: #f0f0f0;
      border-radius: 20px;
      height: 8px;
      margin: 16px 0;
      overflow: hidden;
    }
    .progress-fill {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      height: 100%;
      width: ${completionPercentage}%;
      border-radius: 20px;
      transition: width 0.3s ease;
    }
    .cta-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 12px; 
      font-weight: 600;
      margin: 24px 0;
    }
    .tips {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .tip {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .tip-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      margin-right: 12px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .stats {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .stat-number {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .footer { 
      text-align: center; 
      color: #666; 
      font-size: 14px; 
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Rize</div>
  </div>
  
  <div class="content">
    <div class="greeting">Hey ${name}! 🎨</div>
    
    ${isIncomplete ? `
      <p>We noticed your Rize profile is <strong>${completionPercentage}% complete</strong>. You're so close to having an amazing professional presence!</p>
      
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      
      <p>Complete profiles get <strong>5x more views</strong> and better opportunities. Let's finish what you started!</p>
    ` : `
      <p>Your profile is looking great! Now let's make it absolutely shine and help you stand out from the crowd.</p>
      
      <div class="stats">
        <div class="stat-number">5x</div>
        <div>more profile views with complete galleries</div>
      </div>
    `}
    
    <div class="tips">
      <h3 style="margin-top: 0; color: #1a1a1a;">Here's how to make your profile irresistible:</h3>
      
      <div class="tip">
        <div class="tip-icon">📸</div>
        <div>
          <strong>Add 3-5 gallery items</strong><br>
          Show your work, travels, or creative projects. Visual content gets the most engagement.
        </div>
      </div>
      
      <div class="tip">
        <div class="tip-icon">✍️</div>
        <div>
          <strong>Write a compelling bio</strong><br>
          Tell your story in 2-3 sentences. What makes you unique? What's your mission?
        </div>
      </div>
      
      <div class="tip">
        <div class="tip-icon">🔗</div>
        <div>
          <strong>Connect your socials</strong><br>
          Link your GitHub, LinkedIn, Twitter - make it easy for people to find and connect with you.
        </div>
      </div>
      
      <div class="tip">
        <div class="tip-icon">🚀</div>
        <div>
          <strong>Showcase a project</strong><br>
          Even a small side project shows initiative. Include a description and link if available.
        </div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/${username}" class="cta-button">
        ${isIncomplete ? 'Complete Your Profile' : 'Polish Your Profile'} →
      </a>
    </div>
    
    <p><strong>Real talk:</strong> In today's remote world, your online presence is everything. Make yours count.</p>
    
    <p>Need inspiration? Check out some amazing profiles from our community for ideas.</p>
    
    <p>Rooting for you,<br>The Rize Team</p>
  </div>
  
  <div class="footer">
    <p>© 2025 Rize. Own your digital identity.</p>
    <p><a href="#" style="color: #999; font-size: 12px;">Unsubscribe</a></p>
  </div>
</body>
</html>`,
    text: `
Hey ${name}! 🎨

${isIncomplete 
  ? `We noticed your Rize profile is ${completionPercentage}% complete. You're so close to having an amazing professional presence!

Complete profiles get 5x more views and better opportunities. Let's finish what you started!`
  : `Your profile is looking great! Now let's make it absolutely shine and help you stand out from the crowd.

Did you know? Complete galleries get 5x more profile views.`
}

Here's how to make your profile irresistible:

📸 Add 3-5 gallery items
Show your work, travels, or creative projects. Visual content gets the most engagement.

✍️ Write a compelling bio  
Tell your story in 2-3 sentences. What makes you unique? What's your mission?

🔗 Connect your socials
Link your GitHub, LinkedIn, Twitter - make it easy for people to find and connect with you.

🚀 Showcase a project
Even a small side project shows initiative. Include a description and link if available.

${isIncomplete ? 'Complete' : 'Polish'} your profile: ${process.env.NEXT_PUBLIC_APP_URL}/${username}

Real talk: In today's remote world, your online presence is everything. Make yours count.

Need inspiration? Check out some amazing profiles from our community for ideas.

Rooting for you,
The Rize Team

© 2025 Rize. Own your digital identity.
Unsubscribe: [link]
    `
  }
}

export const EMAIL_TEMPLATES = {
  welcome: generateWelcomeEmail,
  followUp: generateFollowUpEmail,
} as const