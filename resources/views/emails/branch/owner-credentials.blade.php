<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Branch Login Credentials</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding:30px 0;">
                <img src="{{ config('app.logo_url') }}" width="80" alt="{{ config('app.name') }}">
            </td>
        </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">

                <table width="600" style="background:#ffffff;padding:35px;border-radius:8px;">
                    <tr>
                        <td>

                            <h2 style="margin-top:0;">Hello {{ $user->name }},</h2>

                            <p>Your branch account has been successfully created.</p>

                            <h3 style="margin-bottom:5px;">Login Details:</h3>

                            <p>
                                <strong>Email:</strong> {{ $user->email }} <br>
                                <strong>Temporary Password:</strong> {{ $password }}
                            </p>

                            <p style="margin-top:20px;">
                                For security reasons, please reset your password immediately.
                            </p>

                            <p style="text-align:center;margin:35px 0;">
                                <a href="{{ $resetUrl }}" target="_blank" style="background:#111827;color:#ffffff;padding:14px 25px;
   text-decoration:none;border-radius:6px;font-weight:bold;">
                                    Reset Your Password
                                </a>
                            </p>

                            <p>If the button doesn't work, copy this link:</p>
                            <p style="word-break:break-all;">
                                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
                            </p>

                            <hr style="margin:30px 0;">

                            <p style="font-size:13px;color:#6b7280;">
                                If you did not expect this email, please contact support.
                            </p>

                            <p>
                                Regards,<br>
                                {{ config('app.name') }}
                            </p>

                        </td>
                    </tr>
                </table>

                <p style="font-size:12px;color:#aaa;margin-top:25px;">
                    © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>

            </td>
        </tr>
    </table>

</body>

</html>