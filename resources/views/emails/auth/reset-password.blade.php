<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
        <td align="center" style="padding:25px 0;">
            <a href="{{ config('app.url') }}"
               style="text-decoration:none;display:inline-block;">
                <img src="{{ config('app.logo_url') }}"
                     alt="{{ config('app.name') }} Logo"
                     width="75"
                     height="75"
                     style="display:block;border:none;">
            </a>
        </td>
    </tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
        <td align="center">

            <table width="570" style="background:#fff;border-radius:4px;margin-top:30px;padding:32px;">
                <tr>
                    <td>
                        <h2>Hello {{ $name }}!</h2>

                        <p>Click the button below to reset your password.</p>

                        <p style="text-align:center;margin:30px 0;">
                            <a target="_blank" href="{{ $resetUrl }}"
                               style="background:#18181b;color:#fff;padding:12px 20px;
                               text-decoration:none;border-radius:4px;display:inline-block;">
                                Reset Password
                            </a>
                        </p>

                        <p>If you did not request this, ignore this email.</p>

                        <p>
                            Regards,<br>
                            {{ config('app.name') }}
                        </p>

                        <hr>

                        <p style="font-size:12px;color:#999;">
                            If the button doesn't work, copy this URL:<br>
                            <a target="_blank" href="{{ $resetUrl }}">{{ $resetUrl }}</a>
                        </p>
                    </td>
                </tr>
            </table>

            <p style="font-size:12px;color:#aaa;margin-top:20px;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>

        </td>
    </tr>
</table>

</body>
</html>
