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

def get_new_account_admin_notification_template(user_info: dict) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Account Registration</title>
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
            .info-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }}
            .info-table td {{
                padding: 12px;
                border-bottom: 1px solid #e4e4e7;
            }}
            .info-table td:first-child {{
                font-weight: 600;
                width: 140px;
                color: #52525b;
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
            .footer {{
                background-color: #f4f4f5;
                padding: 24px;
                text-align: center;
                color: #71717a; /* Zinc 500 */
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-icon">🔔</div>
                <span class="brand-name">Admin Notification</span>
            </div>
            <div class="content">
                <h1 class="h1">New Account Created</h1>
                <p>A new user has just registered on TruthLens AI.</p>
                
                <table class="info-table">
                    <tr>
                        <td>Username</td>
                        <td>{user_info.get('username', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>{user_info.get('email', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Full Name</td>
                        <td>{user_info.get('full_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Platform</td>
                        <td>{user_info.get('platform', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Browser</td>
                        <td>{user_info.get('browser', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Time</td>
                        <td>{user_info.get('time', 'N/A')}</td>
                    </tr>
                </table>
            </div>
            <div class="footer">
                <p>TruthLens AI Admin Notification System</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_admin_support_notification_template(ticket_info: dict) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Support Request</title>
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
                background-color: #0f172a;
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }}
            .content {{
                padding: 40px;
                color: #3f3f46;
                line-height: 1.6;
            }}
            .h1 {{
                color: #18181b;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
                margin-top: 0;
            }}
            .badge {{
                display: inline-block;
                padding: 4px 12px;
                background-color: #2563eb;
                color: white;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 20px;
            }}
            .info-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }}
            .info-table td {{
                padding: 12px;
                border-bottom: 1px solid #e4e4e7;
            }}
            .info-table td:first-child {{
                font-weight: 600;
                width: 140px;
                color: #52525b;
            }}
            .message-box {{
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin-top: 20px;
                white-space: pre-wrap;
            }}
            .footer {{
                background-color: #f4f4f5;
                padding: 24px;
                text-align: center;
                color: #71717a;
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0;">Support Center</h2>
            </div>
            <div class="content">
                <div class="badge">New Ticket</div>
                <h1 class="h1">Support Request Received</h1>
                <p>A new user support ticket has been submitted with the following details:</p>
                
                <table class="info-table">
                    <tr>
                        <td>Full Name</td>
                        <td>{ticket_info.get('full_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>{ticket_info.get('email', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td>Phone</td>
                        <td>{ticket_info.get('phone_number', 'Not provided')}</td>
                    </tr>
                    <tr>
                        <td>Reason</td>
                        <td>{ticket_info.get('reason', 'N/A')}</td>
                    </tr>
                </table>
                
                <div style="margin-top: 30px; font-weight: 600; color: #18181b;">User Message:</div>
                <div class="message-box">
                    {ticket_info.get('message', '')}
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2026 TruthLens AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_user_support_confirmation_template(ticket_info: dict) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We've Received Your Request</title>
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
                background-color: #18181b;
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }}
            .content {{
                padding: 40px;
                color: #3f3f46;
                line-height: 1.6;
            }}
            .h1 {{
                color: #18181b;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
                margin-top: 0;
            }}
            .message-copy {{
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin-top: 20px;
                font-style: italic;
            }}
            .footer {{
                background-color: #f4f4f5;
                padding: 24px;
                text-align: center;
                color: #71717a;
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0;">TruthLens AI</h2>
            </div>
            <div class="content">
                <h1 class="h1">Hello {ticket_info.get('full_name', 'there')},</h1>
                <p>Thank you for reaching out to TruthLens AI Support.</p>
                <p>We have received your request regarding <strong>{ticket_info.get('reason', 'Support')}</strong> and our team has been notified.</p>
                <p>We will review your message and try to fix your issues as soon as possible. You can expect a response at this email address.</p>
                
                <div style="margin-top: 30px; font-weight: 600; color: #18181b;">A copy of your message:</div>
                <div class="message-copy">
                    "{ticket_info.get('message', '')}"
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2026 TruthLens AI. All rights reserved.</p>
                <p>Secure. Accurate. Truthful.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_support_resolved_template(ticket_info: dict) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request Resolved</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }}
            .header {{ background-color: #10b981; padding: 30px; text-align: center; color: #ffffff; }}
            .content {{ padding: 40px; color: #3f3f46; line-height: 1.6; }}
            .h1 {{ color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 20px; margin-top: 0; }}
            .footer {{ background-color: #f4f4f5; padding: 24px; text-align: center; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0;">Support Resolved</h2>
            </div>
            <div class="content">
                <h1 class="h1">Hello {ticket_info.get('full_name', 'there')},</h1>
                <p>Good news! Your support request regarding <strong>{ticket_info.get('reason', 'Support')}</strong> has been marked as <strong>Solved</strong> by our team.</p>
                <p>We hope the solution provided meets your needs. If you have any further questions or if the issue persists, please don't hesitate to open a new ticket or reply to this email.</p>
                <p>Thank you for using TruthLens AI!</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 TruthLens AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_support_rejected_template(ticket_info: dict) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request Update</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }}
            .header {{ background-color: #ef4444; padding: 30px; text-align: center; color: #ffffff; }}
            .content {{ padding: 40px; color: #3f3f46; line-height: 1.6; }}
            .h1 {{ color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 20px; margin-top: 0; }}
            .reason-box {{ background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fee2e2; margin-top: 20px; color: #b91c1c; }}
            .footer {{ background-color: #f4f4f5; padding: 24px; text-align: center; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0;">Support Update</h2>
            </div>
            <div class="content">
                <h1 class="h1">Hello {ticket_info.get('full_name', 'there')},</h1>
                <p>We are writing to provide an update on your support request regarding <strong>{ticket_info.get('reason', 'Support')}</strong>.</p>
                <p>Unfortunately, your request has been <strong>Rejected</strong> for the following reason:</p>
                
                <div class="reason-box">
                    <strong>Reason for Rejection:</strong><br>
                    {ticket_info.get('rejection_reason', 'No specific reason provided.')}
                </div>
                
                <p style="margin-top: 20px;">If you believe this is a mistake or have additional information to provide, please feel free to submit a new request with more details.</p>
                <p>Thank you for your understanding.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 TruthLens AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
