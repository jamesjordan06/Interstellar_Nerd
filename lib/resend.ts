import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const sendPasswordSetupEmail = async (email: string, name: string, token: string) => {
  const setupUrl = `${process.env.NEXTAUTH_URL}/auth/setup-password?token=${token}`
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Interstellar Nerd Forum <noreply@interstellarnerd.com>',
      to: [email],
      subject: 'Set up your password - Interstellar Nerd Forum',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">🚀 Interstellar Nerd Forum</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              We noticed you tried to sign in with your email and password, but your account was originally 
              created using Google OAuth. To secure your account and enable password login, please set up 
              a password using the link below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" 
                 style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; font-weight: 500; display: inline-block;">
                Set Up Your Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
              This link will expire in 24 hours for security reasons. If you didn't request this, 
              you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>© 2024 Interstellar Nerd Forum. Built for space enthusiasts and tech nerds.</p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
} 