import { NextRequest, NextResponse } from "next/server";

interface SendEmailBody {
  email: string;
  name: string;
}

interface ResendErrorResponse {
  message?: string;
  statusCode?: number;
}

function buildConfirmationHtml(name: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
  <title>SVU AI Studio</title>
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:'Cairo',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563EB 0%,#1d4ed8 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                SVU AI Studio
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#ffffff;line-height:1.8;">
                مرحباً ${name} 👋
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.9;">
                تم تسجيلك بنجاح في قائمة انتظار SVU AI Studio
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#e2e8f0;line-height:1.9;">
                سيصلك رابط الوصول المبكر للمنصة قريباً جداً
              </p>
              <div style="border-top:1px solid #1e293b;padding-top:24px;margin-top:8px;">
                <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.8;">
                  شكراً لثقتك — فريق SVU AI Studio
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#020617;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0;font-size:12px;color:#475569;">
                &copy; ${new Date().getFullYear()} SVU AI Studio. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: SendEmailBody;

  try {
    body = (await req.json()) as SendEmailBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { email, name } = body;

  if (!email || !name) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: email and name" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: true, emailSent: false },
      { status: 200 }
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SVU AI Studio <onboarding@resend.dev>",
        to: [email],
        subject: "SVU AI Studio — تم تسجيلك بنجاح!",
        html: buildConfirmationHtml(name),
      }),
    });

    if (response.ok) {
      return NextResponse.json(
        { success: true, emailSent: true },
        { status: 200 }
      );
    }

    const errorData = (await response.json()) as ResendErrorResponse;
    console.error("[send-email] Resend API error:", response.status, errorData);

    return NextResponse.json(
      { success: true, emailSent: false },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[send-email] Failed to call Resend API:", message);

    return NextResponse.json(
      { success: true, emailSent: false },
      { status: 200 }
    );
  }
}
