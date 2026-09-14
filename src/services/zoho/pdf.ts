import { isZohoConfigured } from './auth';
import { zohoDownloadRequest } from './client';
import { ZohoInvoice, ZohoPayment } from '@/types/zoho';

/**
 * Downloads official invoice PDF from Zoho Books API,
 * or generates an authentic PDF document if running in demo/fallback mode.
 */
export async function downloadInvoicePdf(
  invoice: ZohoInvoice
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const filename = `Invoice-${invoice.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  if (isZohoConfigured() && invoice.invoice_id && !invoice.invoice_id.startsWith('mock-')) {
    try {
      const { buffer, contentType } = await zohoDownloadRequest(`/invoices/${invoice.invoice_id}`);
      return { buffer, filename, contentType };
    } catch (err: any) {
      console.warn(`[Zoho PDF Proxy] Could not fetch live PDF from Zoho, generating fallback PDF:`, err.message);
    }
  }

  // Generate clean, authentic PDF
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
    description: invoice.description || 'Professional Laundry & Linen Care Services',
    lineItems: invoice.line_items || [
      { name: 'Commercial Laundry & Linen Care', quantity: 1, rate: invoice.total, item_total: invoice.total },
    ],
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

  if (isZohoConfigured() && payment.payment_id && !payment.payment_id.startsWith('mock-')) {
    try {
      const { buffer, contentType } = await zohoDownloadRequest(`/customerpayments/${payment.payment_id}`);
      return { buffer, filename, contentType };
    } catch (err: any) {
      console.warn(`[Zoho PDF Proxy] Could not fetch live receipt from Zoho, generating fallback PDF:`, err.message);
    }
  }

  // Generate clean, authentic receipt PDF
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
    description: `Payment received via ${payment.payment_mode || 'Cash'} for Invoice ${invoiceNumber || payment.invoice_numbers || 'Linen Service'}`,
    paymentMode: payment.payment_mode || 'Cash',
    referenceNumber: payment.reference_number,
    lineItems: [
      { name: `Payment for ${invoiceNumber || payment.invoice_numbers || 'Laundry Services'}`, quantity: 1, rate: payment.amount, item_total: payment.amount },
    ],
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

/**
 * Pure TypeScript standard PDF 1.4 Generator
 * Creates lightweight, valid PDF documents without external dependencies.
 */
function generateDocumentPdf(data: DocumentPdfData): Buffer {
  const isReceipt = data.docType === 'PAYMENT RECEIPT';
  const title = isReceipt ? 'OFFICIAL PAYMENT RECEIPT' : 'COMMERCIAL TAX INVOICE';

  const escapePdfText = (str: string) =>
    (str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const lines: string[] = [];

  // Business Header
  lines.push('BT /F2 20 Tf 50 780 Td (ANANKE LAUNDRY (PVT) LTD) Tj ET');
  lines.push('BT /F1 9 Tf 50 765 Td (Cleanline Linen Management Network - No. 195/2, Matara Road, Unawatuna, Galle) Tj ET');
  lines.push('BT /F1 9 Tf 50 752 Td (Telephone: 091 225 0777  |  Web: anankelaundry.com) Tj ET');

  // Horizontal separator rule
  lines.push('0.5 w 0.2 0.25 0.2 RG 50 740 m 545 740 l S');

  // Document Title Banner
  lines.push(`BT /F2 15 Tf 50 715 Td (${escapePdfText(title)}) Tj ET`);
  lines.push(`BT /F2 11 Tf 50 695 Td (${data.docType === 'INVOICE' ? 'Invoice No:' : 'Receipt No:'} ${escapePdfText(data.number)}) Tj ET`);
  lines.push(`BT /F1 10 Tf 50 680 Td (Date: ${escapePdfText(data.date)}) Tj ET`);
  if (data.dueDate) {
    lines.push(`BT /F1 10 Tf 50 665 Td (Due Date: ${escapePdfText(data.dueDate)}) Tj ET`);
  }

  // Customer Information Box
  lines.push('0.8 0.85 0.82 rg 330 655 215 75 re f');
  lines.push('0.6 0.65 0.62 RG 330 655 215 75 re S');
  lines.push('BT /F2 10 Tf 340 715 Td (BILLED TO:) Tj ET');
  lines.push(`BT /F2 11 Tf 340 700 Td (${escapePdfText(data.customerName)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 340 685 Td (Location: Unawatuna / Galle Region) Tj ET`);
  lines.push(`BT /F2 9 Tf 340 668 Td (Status: ${escapePdfText(data.status.toUpperCase())}) Tj ET`);

  // Table Header
  const tableTop = 620;
  lines.push(`0.2 0.3 0.25 rg 50 ${tableTop} 495 24 re f`);
  lines.push(`BT /F2 10 Tf 1 1 1 rg 60 ${tableTop + 7} Td (Description / Service) Tj ET`);
  lines.push(`BT /F2 10 Tf 1 1 1 rg 330 ${tableTop + 7} Td (Qty) Tj ET`);
  lines.push(`BT /F2 10 Tf 1 1 1 rg 400 ${tableTop + 7} Td (Rate) Tj ET`);
  lines.push(`BT /F2 10 Tf 1 1 1 rg 480 ${tableTop + 7} Td (Total) Tj ET`);

  // Table Rows
  let currentY = tableTop - 25;
  data.lineItems.forEach((item, idx) => {
    const bgGray = idx % 2 === 0 ? '0.96 0.97 0.96' : '1 1 1';
    lines.push(`${bgGray} rg 50 ${currentY - 5} 495 22 re f`);
    lines.push('0.85 0.85 0.85 RG 50 545 m 545 545 l S');

    lines.push(`BT /F1 9.5 Tf 0.1 0.1 0.1 rg 60 ${currentY + 2} Td (${escapePdfText(item.name)}) Tj ET`);
    lines.push(`BT /F1 9.5 Tf 335 ${currentY + 2} Td (${item.quantity || 1}) Tj ET`);
    lines.push(`BT /F1 9.5 Tf 395 ${currentY + 2} Td (${(item.rate || item.item_total || 0).toLocaleString()}) Tj ET`);
    lines.push(`BT /F2 9.5 Tf 475 ${currentY + 2} Td (${(item.item_total || item.rate || 0).toLocaleString()}) Tj ET`);

    currentY -= 22;
  });

  // Totals Box
  currentY -= 15;
  lines.push(`0.5 w 0.2 0.2 0.2 RG 330 ${currentY} m 545 ${currentY} l S`);
  currentY -= 20;

  lines.push(`BT /F1 10 Tf 0.2 0.2 0.2 rg 350 ${currentY} Td (Total Amount:) Tj ET`);
  lines.push(`BT /F2 11 Tf 470 ${currentY} Td (${data.currency} ${data.total.toLocaleString()}) Tj ET`);

  currentY -= 18;
  lines.push(`BT /F1 10 Tf 350 ${currentY} Td (Amount Paid:) Tj ET`);
  lines.push(`BT /F2 11 Tf 0.1 0.5 0.2 rg 470 ${currentY} Td (${data.currency} ${data.paid.toLocaleString()}) Tj ET`);

  currentY -= 18;
  lines.push(`BT /F2 10 Tf 0.2 0.2 0.2 rg 350 ${currentY} Td (Balance Due:) Tj ET`);
  const balanceColor = data.balance > 0 ? '0.8 0.1 0.1' : '0.1 0.5 0.2';
  lines.push(`BT /F2 11 Tf ${balanceColor} rg 470 ${currentY} Td (${data.currency} ${data.balance.toLocaleString()}) Tj ET`);

  // Footer notes & Cleanline accreditation
  lines.push('0.5 w 0.8 0.8 0.8 RG 50 110 m 545 110 l S');
  lines.push('BT /F1 8 Tf 0.4 0.4 0.4 rg 50 95 Td (Payment Terms: As per commercial contract or cash on collection. Direct inquiries to 091 225 0777.) Tj ET');
  lines.push('BT /F2 8.5 Tf 0.2 0.3 0.25 rg 50 80 Td (Ananke Laundry - Quality Textile Care from Unawatuna, Galle  |  Member of Cleanline Linen Management Network) Tj ET');

  const streamContent = lines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf8');

  const pdfTemplate = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
0000000397 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${470 + streamLength}
%%EOF`;

  return Buffer.from(pdfTemplate, 'utf8');
}
