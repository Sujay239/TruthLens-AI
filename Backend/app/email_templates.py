def get_password_reset_template(reset_link: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f5;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }}
            .header {{
                background-color: #18181b; /* Zinc 900 */
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }}
            .logo-icon {{
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background-color: #2563eb; /* Blue 600 */
                border-radius: 8px;
                margin-bottom: 10px;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }}
            .brand-name {{
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
                margin-top: 10px;
                display: block;
            }}
            .content {{
                padding: 40px;
                color: #3f3f46; /* Zinc 700 */
                line-height: 1.6;
            }}
            .h1 {{
                color: #18181b;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
                margin-top: 0;
            }}
            .button {{
                display: block;
                width: fit-content;
                min-width: 200px;
                margin: 30px auto;
                padding: 14px 28px;
                background-color: #2563eb; /* Blue 600 */
                color: #ffffff !important;
                text-decoration: none;
                font-weight: 600;
                text-align: center;
                border-radius: 8px;
                transition: background-color 0.2s;
            }}
            .button:hover {{
                background-color: #1d4ed8; /* Blue 700 */
            }}
            .footer {{
                background-color: #f4f4f5;
                padding: 24px;
                text-align: center;
                color: #71717a; /* Zinc 500 */
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
            }}
            .note {{
                font-size: 13px;
                color: #71717a;
                margin-top: 24px;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-icon">🛡️</div>
                <span class="brand-name">TruthLens AI</span>
            </div>
            <div class="content">
                <h1 class="h1">Reset Your Password</h1>
                <p>Hello,</p>
                <p>We received a request to reset the password for your TruthLens AI account. If you didn't make this request, you can safely ignore this email.</p>
                
                <a href="{reset_link}" class="button">Reset Password</a>
                
                <p>This password reset link will expire in 15 minutes.</p>
                
                <div class="note">
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">{reset_link}</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; {2026} TruthLens AI. All rights reserved.</p>
                <p>Secure. Accurate. Truthful.</p>
            </div>
        </div>
    </body>
    </html>
    """
def get_welcome_email_template(username: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TruthLens AI</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f5;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }}
            .header {{
                background-color: #18181b; /* Zinc 900 */
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }}
            .logo-icon {{
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background-color: #2563eb; /* Blue 600 */
                border-radius: 8px;
                margin-bottom: 10px;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }}
            .brand-name {{
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
                margin-top: 10px;
                display: block;
            }}
            .content {{
                padding: 40px;
                color: #3f3f46; /* Zinc 700 */
                line-height: 1.6;
            }}
            .h1 {{
                color: #18181b;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
                margin-top: 0;
            }}
            .button {{
                display: block;
                width: fit-content;
                min-width: 200px;
                margin: 30px auto;
                padding: 14px 28px;
                background-color: #2563eb; /* Blue 600 */
                color: #ffffff !important;
                text-decoration: none;
                font-weight: 600;
                text-align: center;
                border-radius: 8px;
                transition: background-color 0.2s;
            }}
            .button:hover {{
                background-color: #1d4ed8; /* Blue 700 */
            }}
            .footer {{
                background-color: #f4f4f5;
                padding: 24px;
                text-align: center;
                color: #71717a; /* Zinc 500 */
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
            }}
            .features {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 30px;
            }}
            .feature-item {{
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                font-size: 14px;
            }}
            .feature-icon {{
                font-size: 20px;
                margin-bottom: 8px;
                display: block;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-icon">🛡️</div>
                <span class="brand-name">TruthLens AI</span>
            </div>
            <div class="content">
                <h1 class="h1">Welcome aboard, {username}!</h1>
                <p>We're thrilled to have you join TruthLens AI, your premier platform for deepfake detection and media verification.</p>
                
                <p>You now have access to our advanced analysis tools designed to help you separate truth from fabrication.</p>
                
                <div class="features">
                    <div class="feature-item">
                        <span class="feature-icon">🔍</span>
                        <strong>DeepFake Detection</strong><br>Analyze videos and images for manipulation.
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📝</span>
                        <strong>Text Analysis</strong><br>Detect AI-generated text and fake news.
                    </div>
                </div>

                <a href="http://localhost:5173/auth" class="button">Go to Dashboard</a>
                
                <p>Get started by uploading your first media file for analysis!</p>
            </div>
            <div class="footer">
                <p>&copy; {2026} TruthLens AI. All rights reserved.</p>
                <p>Secure. Accurate. Truthful.</p>
            </div>
        </div>
    </body>
    </html>
    """
