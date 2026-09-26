import { ZohoInvoice, ZohoPayment } from '@/types/zoho';

/**
 * Downloads official invoice PDF from Zoho Books API,
 * or generates an authentic PDF document if running in demo/fallback mode.
 */
export async function downloadInvoicePdf(
  invoice: ZohoInvoice
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const filename = `Invoice-${invoice.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  // Always generate clean, authentic, non-itemized Ananke Laundry PDF (protects customer item privacy)
  const buffer = generateDocumentPdf({
    docType: 'INVOICE',
    number: invoice.invoice_number,
    date: invoice.date,
    dueDate: invoice.due_date,
    customerName: invoice.customer_name,
    status: invoice.payment_status,
    total: invoice.total,
    paid: invoice.amount_paid,
    balance: invoice.balance,
    currency: invoice.currency_code || 'LKR',
    description: invoice.description || 'Professional Commercial Laundry & Linen Care Services',
    lineItems: [],
  });

  return { buffer, filename, contentType: 'application/pdf' };
}

/**
 * Downloads official payment receipt PDF from Zoho Books API,
 * or generates an authentic PDF document if running in demo/fallback mode.
 */
export async function downloadReceiptPdf(
  payment: ZohoPayment,
  invoiceNumber?: string
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const filename = `Receipt-${payment.payment_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  // Always generate clean, authentic receipt PDF without individual item breakdown
  const buffer = generateDocumentPdf({
    docType: 'PAYMENT RECEIPT',
    number: payment.payment_number,
    date: payment.date,
    customerName: payment.customer_name,
    status: 'Paid',
    total: payment.amount,
    paid: payment.amount,
    balance: 0,
    currency: 'LKR',
    description: `Official Payment Receipt for Invoice ${invoiceNumber || payment.invoice_numbers || 'Laundry Services'}`,
    paymentMode: payment.payment_mode || 'Cash / Bank Transfer',
    referenceNumber: payment.reference_number,
    lineItems: [],
  });

  return { buffer, filename, contentType: 'application/pdf' };
}

interface DocumentPdfData {
  docType: 'INVOICE' | 'PAYMENT RECEIPT';
  number: string;
  date: string;
  dueDate?: string;
  customerName: string;
  status: string;
  total: number;
  paid: number;
  balance: number;
  currency: string;
  description: string;
  paymentMode?: string;
  referenceNumber?: string;
  lineItems: Array<{ name: string; quantity?: number; rate?: number; item_total?: number }>;
}

// Authentic Ananke Laundry circular logo as embedded JPEG bytes
const ANANKE_RECEIPT_LOGO_BASE64 =
  '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';

/**
 * Pure TypeScript standard PDF 1.4 Generator
 * Outputs a true thermal receipt slip matching the authentic Ananke Laundry POS receipt.
 * Explicitly omits individual line items as requested by user.
 */
function generateDocumentPdf(data: DocumentPdfData): Buffer {
  const parts: Buffer[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  function addPart(buf: Buffer | string) {
    const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8');
    parts.push(b);
    currentOffset += b.length;
  }

  function addObject(objNum: number, contentBuf: Buffer | string) {
    offsets[objNum] = currentOffset;
    addPart(`${objNum} 0 obj\n`);
    addPart(contentBuf);
    addPart('\nendobj\n');
  }

  const escapePdfText = (str: string) =>
    (str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  // Decode embedded authentic logo
  const logoBuf = Buffer.from(ANANKE_RECEIPT_LOGO_BASE64, 'base64');

  addPart('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Obj 1: Catalog
  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');

  // Obj 2: Pages
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

  // Page height 560 pt gives a clean, perfectly proportioned thermal receipt slip
  const pageHeight = 560;
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 216 ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /img0 7 0 R >> >> /Contents 6 0 R >>`
  );

  // Obj 4: Font F1 (Helvetica regular)
  addObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  // Obj 5: Font F2 (Helvetica bold)
  addObject(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // Page Content Commands (Object 6)
  const lines: string[] = [];

  // Top green logo (45x43.9 pt centered at x=85.5)
  const logoY = pageHeight - 55;
  lines.push(`q 45 0 0 43.91 85.5 ${logoY} cm /img0 Do Q`);

  // Brand Name and Location
  lines.push('0 0 0 rg');
  lines.push(`BT /F2 10.5 Tf 45 ${logoY - 21} Td (Ananke Laundry \\(Pvt\\) Ltd) Tj ET`);
  lines.push(`BT /F1 9 Tf 68 ${logoY - 33} Td (Southern Province) Tj ET`);
  lines.push(`BT /F1 9 Tf 89 ${logoY - 45} Td (SriLanka) Tj ET`);

  // Dashed separator line 1
  const sep1Y = logoY - 57;
  lines.push(`[1.8 0.9] 0 d 0.235 0.239 0.227 RG 13.2 ${sep1Y} m 202.8 ${sep1Y} l S`);

  // Document Title
  const title = data.docType === 'PAYMENT RECEIPT' ? 'OFFICIAL RECEIPT' : 'INVOICE';
  const titleX = data.docType === 'PAYMENT RECEIPT' ? 62 : 88.5;
  const titleY = sep1Y - 13;
  lines.push(`BT /F2 10.5 Tf ${titleX} ${titleY} Td (${title}) Tj ET`);

  // Dashed separator line 2
  const sep2Y = titleY - 10;
  lines.push(`[1.8 0.9] 0 d 13.2 ${sep2Y} m 202.8 ${sep2Y} l S`);

  // Invoice / Receipt Metadata
  const numLabel = data.docType === 'PAYMENT RECEIPT' ? 'Receipt#' : 'Invoice#';
  const meta1Y = sep2Y - 17;
  const meta2Y = meta1Y - 14;
  lines.push(`BT /F1 9 Tf 15.45 ${meta1Y} Td (${numLabel}) Tj ET`);
  lines.push(`BT /F2 9 Tf 135 ${meta1Y} Td (${escapePdfText(data.number)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 15.45 ${meta2Y} Td (Date) Tj ET`);
  lines.push(`BT /F1 9 Tf 135 ${meta2Y} Td (${escapePdfText(data.date)}) Tj ET`);

  // Dashed separator line 3
  const sep3Y = meta2Y - 12;
  lines.push(`[1.8 0.9] 0 d 13.2 ${sep3Y} m 202.8 ${sep3Y} l S`);

  // Customer Name (Bill To / Received From)
  const billLabel = data.docType === 'PAYMENT RECEIPT' ? 'Received From:' : 'Bill To:';
  const billLabelY = sep3Y - 16;
  const custNameY = billLabelY - 14;
  lines.push(`BT /F1 9 Tf 13.2 ${billLabelY} Td (${billLabel}) Tj ET`);
  lines.push(`BT /F2 10 Tf 13.2 ${custNameY} Td (${escapePdfText(data.customerName)}) Tj ET`);

  // Dashed separator line 4
  const sep4Y = custNameY - 12;
  lines.push(`[1.8 0.9] 0 d 13.2 ${sep4Y} m 202.8 ${sep4Y} l S`);

  // Financial Section: TOTAL (Explicitly NO item rows, per user request)
  // Double solid line borders around TOTAL
  const totalTopY = sep4Y - 14;
  const totalBotY = totalTopY - 28;
  const totalTextY = totalTopY - 15;
  lines.push(`[] 0 d 0.75 w 0.235 0.239 0.227 RG 13.2 ${totalTopY} m 202.8 ${totalTopY} l S`);
  lines.push(`BT /F2 10.5 Tf 20 ${totalTextY} Td (TOTAL) Tj ET`);
  const formattedTotal = `${data.currency} ${Number(data.total || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  lines.push(`BT /F2 10.5 Tf 115 ${totalTextY} Td (${formattedTotal}) Tj ET`);
  lines.push(`13.2 ${totalBotY} m 202.8 ${totalBotY} l S`);

  let currentY = totalBotY - 14;

  // Concise Payment breakdown if partially paid or settlement
  if (data.paid > 0 && data.balance > 0) {
    const formattedPaid = `${data.currency} ${Number(data.paid).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const formattedBal = `${data.currency} ${Number(data.balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    lines.push(`BT /F1 8.5 Tf 20 ${currentY} Td (Amount Paid:) Tj ET`);
    lines.push(`BT /F1 8.5 Tf 115 ${currentY} Td (${formattedPaid}) Tj ET`);
    currentY -= 12;
    lines.push(`BT /F2 8.5 Tf 20 ${currentY} Td (Balance Due:) Tj ET`);
    lines.push(`BT /F2 8.5 Tf 115 ${currentY} Td (${formattedBal}) Tj ET`);
    currentY -= 14;
  } else if (data.paid > 0 && data.balance === 0) {
    lines.push(`BT /F2 8.5 Tf 20 ${currentY} Td (Status: Paid in Full) Tj ET`);
    currentY -= 14;
  }

  // Dashed separator before terms
  lines.push(`[1.8 0.9] 0 d 13.2 ${currentY} m 202.8 ${currentY} l S`);
  currentY -= 12;

  // Terms and conditions (authentic wording from original receipt)
  lines.push(`BT /F2 7.5 Tf 13.2 ${currentY} Td (Terms & Conditions: All Laundry is accepted) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (owner's risk while the utmost care will be exercised.) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (Person handling over and collecting the items takes) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (ownership to validate against receipt.) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (Any claims of loss ,damage or any other complaint) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (of an other to be reported at the time of accepting) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (the items.) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (A 100% Additional charge will be added for the all) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (orders delivered on the same day.) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (The delay in settling the payment will be charged) Tj ET`);
  currentY -= 11;
  lines.push(`BT /F1 7.2 Tf 13.2 ${currentY} Td (10% late Payment fees.) Tj ET`);

  // Signature line
  currentY -= 20;
  lines.push(`BT /F1 7.5 Tf 13.2 ${currentY} Td (Date: ................................   Sign: ......................................) Tj ET`);

  // Footer Greeting
  currentY -= 22;
  lines.push(`BT /F1 8 Tf 58 ${currentY} Td (Thanks for your business.) Tj ET`);

  const streamBuf = Buffer.from(lines.join('\n'), 'utf8');
  const obj6Header = Buffer.from(`<< /Length ${streamBuf.length} >>\nstream\n`, 'utf8');
  const obj6Footer = Buffer.from('\nendstream', 'utf8');
  addObject(6, Buffer.concat([obj6Header, streamBuf, obj6Footer]));

  // Obj 7: Image XObject (JPEG logo)
  const obj7Header = Buffer.from(
    `<< /Type /XObject /Subtype /Image /Width 163 /Height 159 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBuf.length} >>\nstream\n`,
    'utf8'
  );
  const obj7Footer = Buffer.from('\nendstream', 'utf8');
  addObject(7, Buffer.concat([obj7Header, logoBuf, obj7Footer]));

  // Xref table
  const startXref = currentOffset;
  let xrefStr = 'xref\n0 8\n0000000000 65535 f \n';
  for (let i = 1; i <= 7; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    xrefStr += `${off} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  addPart(xrefStr);

  return Buffer.concat(parts);
}
