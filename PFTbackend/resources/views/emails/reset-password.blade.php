<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
</head>

<body style="margin:0; padding:0; font-family: 'Helvetica', Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Card Container -->
                <table width="100%" max-width="600px" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 40px;">
                    <!-- Header / Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <h1 style="color: #10B981; font-size: 28px; margin: 0;">YourAppLogo</h1>
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td align="center" style="padding-bottom: 10px;">
                            <h2 style="color: #111827; font-size: 22px; margin: 0;">Reset Your Password</h2>
                        </td>
                    </tr>

                    <!-- Instructions -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <p style="color: #6B7280; font-size: 16px; margin: 0;">
                                You requested a password reset. Click the button below to reset your password.
                            </p>
                        </td>
                    </tr>

                    <!-- Reset Button -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <a href="{{ $url }}" target="_blank"
                                style="background-color: #10B981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                                Reset Password
                            </a>
                        </td>
                    </tr>

                    <!-- Fallback URL -->
                    <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <p style="color: #6B7280; font-size: 14px; word-break: break-all;">
                                Or copy and paste this URL into your browser:<br>
                                <a href="{{ $url }}" style="color: #10B981;">{{ $url }}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Note -->
                    <tr>
                        <td align="center" style="padding-top: 20px; border-top: 1px solid #E5E7EB;">
                            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                                If you didn’t request this, you can safely ignore this email.<br>
                                Thank you, <br>
                                <strong>YourAppName Team</strong>
                            </p>
                        </td>
                    </tr>
                </table>
                <!-- End Card Container -->
            </td>
        </tr>
    </table>
</body>

</html>