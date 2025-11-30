import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { note } = await request.json();

    if (!note || typeof note !== "string" || note.trim().length === 0) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    // For now, we'll just log the note and return success
    // In production, you would integrate with an email service like:
    // - Resend (resend.com)
    // - SendGrid
    // - Nodemailer with SMTP
    // - AWS SES
    
    console.log("=== NEW WEBSITE NOTE ===");
    console.log("To: feliciamtang@gmail.com");
    console.log("Subject: Website Notes");
    console.log("Content:", note);
    console.log("Time:", new Date().toISOString());
    console.log("========================");

    // Example with Resend (uncomment and add RESEND_API_KEY to env):
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: 'feliciamtang@gmail.com',
      subject: 'Website Notes',
      text: `New note from your website:\n\n${note}\n\nReceived at: ${new Date().toISOString()}`,
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing note:", error);
    return NextResponse.json(
      { error: "Failed to process note" },
      { status: 500 }
    );
  }
}

