const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@ricevillageshops.com';

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return { skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Rice Village Shops <noreply@ricevillageshops.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })
  });

  return res.json();
}

export async function notifyAdminNewSubmission(submission) {
  const typeLabel = submission.type === 'ad' ? 'Ad' : 'Listing';
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New ${typeLabel} Submission: ${submission.business_name}`,
    html: `
      <h2>New ${typeLabel} Submission</h2>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Business:</td><td>${submission.business_name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Contact:</td><td>${submission.contact_name} (${submission.contact_email})</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Category:</td><td>${submission.category || 'N/A'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Address:</td><td>${submission.address || 'N/A'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Description:</td><td>${submission.description || submission.message || 'N/A'}</td></tr>
        ${submission.ad_package ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Ad Package:</td><td>${submission.ad_package}</td></tr>` : ''}
      </table>
      <p style="margin-top:16px;"><a href="https://ricevillageshops.com/admin.html">Review in Admin Dashboard</a></p>
    `
  });
}

export async function notifySubmitterApproved(submission) {
  if (!submission.contact_email) return;
  return sendEmail({
    to: submission.contact_email,
    subject: `Your listing "${submission.business_name}" is now live on Rice Village Shops!`,
    html: `
      <h2>Your Listing is Live!</h2>
      <p>Hi ${submission.contact_name || 'there'},</p>
      <p>Great news — your listing for <strong>${submission.business_name}</strong> has been approved and is now live on Rice Village Shops.</p>
      <p><a href="https://ricevillageshops.com/#directory">View the Directory</a></p>
      <p>Thank you for being part of Rice Village!</p>
    `
  });
}
