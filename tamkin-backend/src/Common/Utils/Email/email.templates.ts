export const confirmEmailTemplate = ({
  userName,
  OTP,
}: {
  userName: string;
  OTP: string;
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Confirm Email</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
      <tr>
        <td align="center">

          <!-- Container -->
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#0f172a; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial, sans-serif;">
                  Tamkin Initiative
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; font-family:Arial, sans-serif; color:#111827;">
                
                <p style="margin:0 0 15px; font-size:16px;">
                  Hello ${userName},
                </p>

                <p style="margin:0 0 20px; font-size:14px; color:#4b5563;">
                  Use the verification code below to confirm your email address:
                </p>

                <!-- OTP -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">
                      <span style="
                        display:inline-block;
                        font-size:26px;
                        letter-spacing:6px;
                        padding:12px 20px;
                        background:#f1f5f9;
                        border-radius:6px;
                        font-weight:bold;
                        color:#0f172a;
                      ">
                        ${OTP}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                  This code expires in 15 minutes. Please do not share it with anyone.
                </p>

                <p style="margin:10px 0 0; font-size:13px; color:#6b7280;">
                  If you didn't request this email, you can safely ignore it.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:15px; background:#f9fafb; font-family:Arial, sans-serif; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  © Tamkin Initiative
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export const resetPasswordOtpTemplate = ({ userName, OTP }: { userName: string; OTP: string }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Password</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
      <tr>
        <td align="center">

          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#0f172a; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial, sans-serif;">
                  Tamkin Initiative
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; font-family:Arial, sans-serif; color:#111827;">
                
                <p style="margin:0 0 15px; font-size:16px;">
                  Hello ${userName},
                </p>

                <p style="margin:0 0 20px; font-size:14px; color:#4b5563;">
                  We received a request to reset your password. Use the code below to proceed:
                </p>

                <!-- OTP -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">
                      <span style="
                        display:inline-block;
                        font-size:26px;
                        letter-spacing:6px;
                        padding:12px 20px;
                        background:#f1f5f9;
                        border-radius:6px;
                        font-weight:bold;
                        color:#0f172a;
                      ">
                        ${OTP}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                  This code expires in 10 minutes. Please do not share it with anyone.
                </p>

                <p style="margin:10px 0 0; font-size:13px; color:#6b7280;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:15px; background:#f9fafb; font-family:Arial, sans-serif; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  © Tamkin Initiative
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export const loginOtpTemplate = ({ userName, OTP }: { userName: string; OTP: string }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Login Verification Code</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
      <tr>
        <td align="center">

          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#0f172a; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial, sans-serif;">
                  Tamkin Initiative
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; font-family:Arial, sans-serif; color:#111827;">
                
                <p style="margin:0 0 15px; font-size:16px;">
                  Hello ${userName},
                </p>

                <p style="margin:0 0 20px; font-size:14px; color:#4b5563;">
                  Use the code below to complete your login:
                </p>

                <!-- OTP -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">
                      <span style="
                        display:inline-block;
                        font-size:26px;
                        letter-spacing:6px;
                        padding:12px 20px;
                        background:#f1f5f9;
                        border-radius:6px;
                        font-weight:bold;
                        color:#0f172a;
                      ">
                        ${OTP}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                  This code expires in 10 minutes. Please do not share it with anyone.
                </p>

                <p style="margin:10px 0 0; font-size:13px; color:#6b7280;">
                  If you didn't attempt to log in, please secure your account immediately.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:15px; background:#f9fafb; font-family:Arial, sans-serif; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  © Tamkin Initiative
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export const enableTwoFATemplate = ({ userName, OTP }: { userName: string; OTP: string }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Enable Two-Factor Authentication</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
      <tr>
        <td align="center">

          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#0f172a; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial, sans-serif;">
                  Tamkin Initiative
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; font-family:Arial, sans-serif; color:#111827;">
                
                <p style="margin:0 0 15px; font-size:16px;">
                  Hello ${userName},
                </p>

                <p style="margin:0 0 20px; font-size:14px; color:#4b5563;">
                  Use the code below to complete enabling Two-Factor Authentication on your account:
                </p>

                <!-- OTP -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">
                      <span style="
                        display:inline-block;
                        font-size:26px;
                        letter-spacing:6px;
                        padding:12px 20px;
                        background:#f1f5f9;
                        border-radius:6px;
                        font-weight:bold;
                        color:#0f172a;
                      ">
                        ${OTP}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                  This code expires in 10 minutes. Please do not share it with anyone.
                </p>

                <p style="margin:10px 0 0; font-size:13px; color:#6b7280;">
                  If you didn't request to enable 2FA, please secure your account immediately.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:15px; background:#f9fafb; font-family:Arial, sans-serif; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  © Tamkin Initiative
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export const disableTwoFATemplate = ({ userName, OTP }: { userName: string; OTP: string }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Disable Two-Factor Authentication</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
      <tr>
        <td align="center">

          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#7f1d1d; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial, sans-serif;">
                  Tamkin Initiative
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; font-family:Arial, sans-serif; color:#111827;">
                
                <p style="margin:0 0 15px; font-size:16px;">
                  Hello ${userName},
                </p>

                <p style="margin:0 0 20px; font-size:14px; color:#4b5563;">
                  Use the code below to confirm disabling Two-Factor Authentication on your account:
                </p>

                <!-- OTP -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">
                      <span style="
                        display:inline-block;
                        font-size:26px;
                        letter-spacing:6px;
                        padding:12px 20px;
                        background:#fef2f2;
                        border-radius:6px;
                        font-weight:bold;
                        color:#7f1d1d;
                      ">
                        ${OTP}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                  This code expires in 10 minutes. Please do not share it with anyone.
                </p>

                <p style="margin:10px 0 0; font-size:13px; color:#6b7280;">
                  If this wasn't you, keep 2FA enabled and secure your account immediately.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:15px; background:#f9fafb; font-family:Arial, sans-serif; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  © Tamkin Initiative
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

export const updateEmailOtpTemplate = ({ userName, OTP }: { userName: string; OTP: string }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Confirm New Email</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
      <tr>
        <td align="center">

          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#0f172a; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial, sans-serif;">
                  Tamkin Initiative
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; font-family:Arial, sans-serif; color:#111827;">
                
                <p style="margin:0 0 15px; font-size:16px;">
                  Hello ${userName},
                </p>

                <p style="margin:0 0 20px; font-size:14px; color:#4b5563;">
                  We received a request to update your email address. Use the code below to confirm your new email:
                </p>

                <!-- OTP -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">
                      <span style="
                        display:inline-block;
                        font-size:26px;
                        letter-spacing:6px;
                        padding:12px 20px;
                        background:#f1f5f9;
                        border-radius:6px;
                        font-weight:bold;
                        color:#0f172a;
                      ">
                        ${OTP}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                  This code expires in 10 minutes. Please do not share it with anyone.
                </p>

                <p style="margin:10px 0 0; font-size:13px; color:#6b7280;">
                  If you didn't request this change, please secure your account immediately.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:15px; background:#f9fafb; font-family:Arial, sans-serif; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  © Tamkin Initiative
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}