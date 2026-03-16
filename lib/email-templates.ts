/**
 * HTML email templates for KitFix 2.0.
 *
 * All templates use inline CSS for email client compatibility.
 * Brand colour: Electric Blue oklch(0.65 0.22 260) → #3366FF fallback.
 * Currency: South African Rand (ZAR), formatted as R X,XXX.XX
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BRAND_BLUE = "#3366FF";
const BRAND_DARK = "#1a1a2e";
const TEXT_PRIMARY = "#1f2937";
const TEXT_SECONDARY = "#6b7280";
const BG_LIGHT = "#f9fafb";

/** Format a number as ZAR currency: R 1,250.00 */
export function formatZAR(amount: number): string {
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------------------------------------------------------------------
// Layout wrapper
// ---------------------------------------------------------------------------

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KitFix</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_LIGHT};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_DARK};padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:${BRAND_BLUE};">Kit</span><span style="color:#ffffff;">Fix</span>
              </h1>
              <p style="margin:4px 0 0;font-size:12px;color:${TEXT_SECONDARY};letter-spacing:1px;text-transform:uppercase;">
                Repair &middot; Restore &middot; Return
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 32px;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:${TEXT_SECONDARY};text-align:center;line-height:1.6;">
                KitFix &mdash; Professional Electronics Repair, South Africa<br />
                This is an automated notification. If you no longer wish to receive these emails,<br />
                please contact us at <a href="mailto:support@kitfix.co.za" style="color:${BRAND_BLUE};text-decoration:none;">support@kitfix.co.za</a>.
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

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function statusBadge(status: string): string {
  const colours: Record<string, { bg: string; fg: string }> = {
    received:    { bg: "#dbeafe", fg: "#1e40af" },
    diagnosing:  { bg: "#fef3c7", fg: "#92400e" },
    quoted:      { bg: "#e0e7ff", fg: "#3730a3" },
    repairing:   { bg: "#fef9c3", fg: "#854d0e" },
    completed:   { bg: "#d1fae5", fg: "#065f46" },
    collected:   { bg: "#f3f4f6", fg: "#374151" },
  };
  const c = colours[status.toLowerCase()] ?? { bg: "#e5e7eb", fg: TEXT_PRIMARY };

  return `<span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:600;background-color:${c.bg};color:${c.fg};text-transform:capitalize;">${status}</span>`;
}

// ---------------------------------------------------------------------------
// Template: Status Update
// ---------------------------------------------------------------------------

export function statusUpdateTemplate(
  customerName: string,
  repairId: string,
  newStatus: string,
): string {
  return layout(`
    <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">
      Hi <strong>${customerName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.6;">
      Your repair <strong style="color:${BRAND_BLUE};">#${repairId}</strong> has been updated.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background-color:${BG_LIGHT};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 8px;font-size:13px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.5px;">
            New Status
          </p>
          ${statusBadge(newStatus)}
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;">
      We&rsquo;ll keep you posted on any further updates. If you have questions, just reply to this email.
    </p>
  `);
}

// ---------------------------------------------------------------------------
// Template: Payment Confirmation
// ---------------------------------------------------------------------------

export function paymentConfirmationTemplate(
  customerName: string,
  repairId: string,
  amount: number,
): string {
  return layout(`
    <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">
      Hi <strong>${customerName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.6;">
      We&rsquo;ve received your payment for repair <strong style="color:${BRAND_BLUE};">#${repairId}</strong>. Thank you!
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background-color:${BG_LIGHT};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.5px;">
            Amount Paid
          </p>
          <p style="margin:0;font-size:28px;font-weight:700;color:${BRAND_BLUE};">
            ${formatZAR(amount)}
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:14px;color:${TEXT_PRIMARY};line-height:1.6;">
      <strong>Repair ID:</strong> #${repairId}
    </p>
    <p style="margin:0;font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;">
      A detailed receipt is available in your KitFix dashboard.
    </p>
  `);
}

// ---------------------------------------------------------------------------
// Template: Estimate Ready
// ---------------------------------------------------------------------------

export function estimateReadyTemplate(
  customerName: string,
  repairId: string,
  repairCost: number,
  pickupFee: number,
  deliveryFee: number,
  totalCost: number,
  depositAmount: number,
  pickupRequired: boolean,
  adminNotes?: string,
): string {
  const remainingAmount = totalCost - depositAmount;

  const pickupRow = pickupRequired
    ? `<tr>
        <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};">Pickup Fee</td>
        <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};text-align:right;">${formatZAR(pickupFee)}</td>
      </tr>`
    : "";

  const pickupNotice = pickupRequired
    ? `<div style="background-color:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#9A3412;">📍 Pickup Required</p>
        <p style="margin:0;font-size:13px;color:#9A3412;line-height:1.5;">
          We need to physically inspect your jersey. A courier will collect it from your address after you accept and pay the deposit.
        </p>
      </div>`
    : "";

  const notesSection = adminNotes
    ? `<div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.5px;">Repair Notes</p>
        <p style="margin:0;font-size:14px;color:${TEXT_PRIMARY};line-height:1.6;">${adminNotes}</p>
      </div>`
    : "";

  return layout(`
    <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">
      Hi <strong>${customerName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.6;">
      Great news — we&rsquo;ve reviewed your jersey repair request <strong style="color:${BRAND_BLUE};">#${repairId.slice(0, 8)}</strong> and your quote is ready.
    </p>

    ${pickupNotice}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background-color:${BG_LIGHT};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:13px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.5px;">
            Quote Breakdown
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};">Repair Cost</td>
              <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};text-align:right;">${formatZAR(repairCost)}</td>
            </tr>
            ${pickupRow}
            <tr>
              <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};">Delivery Fee</td>
              <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};text-align:right;">${formatZAR(deliveryFee)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 0 0;"><hr style="border:none;border-top:1px solid #E5E7EB;" /></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:16px;font-weight:700;color:${BRAND_BLUE};">Total</td>
              <td style="padding:6px 0;font-size:16px;font-weight:700;color:${BRAND_BLUE};text-align:right;">${formatZAR(totalCost)}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #E5E7EB;margin:12px 0;" />
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${TEXT_SECONDARY};">50% Deposit (due now)</td>
              <td style="padding:4px 0;font-size:13px;font-weight:600;color:${TEXT_PRIMARY};text-align:right;">${formatZAR(depositAmount)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${TEXT_SECONDARY};">Balance (after repair)</td>
              <td style="padding:4px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${formatZAR(remainingAmount)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${notesSection}

    <p style="margin:0 0 16px;font-size:14px;color:${TEXT_PRIMARY};line-height:1.6;">
      Please log in to your dashboard to review the quote, ${pickupRequired ? "provide your pickup address, " : ""}and pay the 50% deposit to proceed.
    </p>
    <p style="margin:0;font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;">
      Questions? Reply to this email and we&rsquo;ll get back to you shortly.
    </p>
  `);
}

// ---------------------------------------------------------------------------
// Template: Review Request
// ---------------------------------------------------------------------------

export function reviewRequestTemplate(
  customerName: string,
  repairId: string,
): string {
  return layout(`
    <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">
      Hi <strong>${customerName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.6;">
      Your repair <strong style="color:${BRAND_BLUE};">#${repairId}</strong> is all done! We hope everything is working perfectly.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background-color:${BG_LIGHT};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 12px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.6;">
            We&rsquo;d love to hear about your experience.<br />
            Your feedback helps us improve and helps other customers.
          </p>
          <p style="margin:0;font-size:32px;">⭐⭐⭐⭐⭐</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;">
      Log in to your KitFix dashboard to leave a review. It only takes a minute!
    </p>
  `);
}
