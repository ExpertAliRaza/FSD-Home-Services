async function getInvoiceByRequest(requestId) {
  const { getInvoiceByRequest: fetchInvoice } = await import('./api.js');
  return fetchInvoice(requestId);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatRupees(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
}

export async function getInvoicePdf(requestId) {
  const invoice = await getInvoiceByRequest(requestId);
  if (!invoice) throw new Error('Invoice not found.');

  const request = invoice.service_requests;
  const commission = request.commission_transactions?.[0] || null;
  const jobAmount = commission ? Number(commission.job_amount) : 0;

  const leadAssignment = request.lead_assignments?.find(
    (a) => ['assigned', 'accepted', 'completed'].includes(a.status)
  );
  const worker = leadAssignment?.workers;

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 35;
  const marginTop = 30;
  const marginBottom = 30;
  const contentWidth = pageWidth - marginX * 2;

  const brandNavy = '#0f172a';
  const brandGreen = '#047857';
  const brandGreenLight = '#ecfdf5';
  const slateText = '#334155';
  const lightBorder = '#e2e8f0';
  const tableHeaderFill = [15, 23, 42];
  const totalGreen = [4, 120, 87];

  let y = marginTop;

  function checkPage(needed) {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  function drawHorizontalLine() {
    doc.setDrawColor(...hexToRgb(lightBorder));
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);
  }

  function sectionBar(title) {
    checkPage(26);
    doc.setFillColor(...hexToRgb(brandGreenLight));
    doc.rect(marginX, y, contentWidth, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...hexToRgb(brandNavy));
    doc.text(title, marginX + 10, y + 14);
    y += 26;
  }

  function wrapAndAdvance(text, x, maxWidth, fontSize = 10) {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(String(text || ''), maxWidth);
    doc.text(lines, x, y);
    const usedHeight = lines.length * fontSize;
    y += usedHeight;
    return lines.length;
  }

  const logoImg = new Image();
  logoImg.src = '/branding/FSD Home Services logo.png';
  await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; });
  doc.addImage(logoImg, 'PNG', marginX, y, 50, 50);
  y += 60;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(brandNavy));
  doc.setFontSize(26);
  doc.text('INVOICE', pageWidth - marginX, y - 6, { align: 'right' });
  y += 4;

  drawHorizontalLine();
  y += 16;

  checkPage(28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(brandNavy));
  doc.text('Invoice No.:', marginX + 8, y);
  doc.text('Invoice Date:', marginX + 190, y);
  doc.text('Service Date:', marginX + 350, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(slateText));
  doc.text(String(invoice.invoice_number || ''), marginX + 80, y);
  doc.text(formatDate(invoice.invoice_date), marginX + 260, y);
  doc.text(formatDate(request.created_at), marginX + 420, y);
  y += 28;

  sectionBar('BILL TO');

  checkPage(80);
  const billFromY = y;
  const leftWidth = contentWidth / 2 - 20;
  const rightX = marginX + contentWidth / 2 + 10;
  const rightWidth = contentWidth / 2 - 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(slateText));
  wrapAndAdvance(`Customer Name: ${request.customer_name || ''}`, marginX + 8, leftWidth, 10);
  wrapAndAdvance(`Phone: ${request.customer_phone || ''}`, marginX + 8, leftWidth, 10);
  wrapAndAdvance(`Address: ${request.areas?.name || request.area_id || ''}`, marginX + 8, leftWidth, 10);

  y = billFromY;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(brandNavy));
  wrapAndAdvance('BILL FROM', rightX, rightWidth, 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(slateText));
  wrapAndAdvance('FSD Home Services', rightX, rightWidth, 10);
  if (worker) {
    wrapAndAdvance(`Assigned Worker: ${worker.display_name}`, rightX, rightWidth, 10);
    wrapAndAdvance(`${worker.service_categories?.name || worker.service_category_id || ''}`, rightX, rightWidth, 10);
  }

  y += 10;

  const services = [request.service_category_id, ...(request.additional_services || [])].filter(Boolean);
  const primaryService = request.service_categories?.name || request.service_category_id || 'Service';
  const serviceRows = services.length ? services : [primaryService];

  const colX = {
    sno: marginX + 8,
    service: marginX + 60,
    description: marginX + 180,
    amount: marginX + contentWidth - 80
  };
  const colWidths = {
    service: colX.description - colX.service - 8,
    description: colX.amount - colX.description - 8
  };

  checkPage(32);
  doc.setFillColor(...tableHeaderFill);
  doc.rect(marginX, y, contentWidth, 26, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('S. NO.', colX.sno, y + 15);
  doc.text('SERVICE', colX.service, y + 15);
  doc.text('DESCRIPTION OF WORK', colX.description, y + 15);
  doc.text('AMOUNT', colX.amount, y + 15);
  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(slateText));

  serviceRows.forEach((svc, idx) => {
    checkPage(28);
    const isPrimary = idx === 0;
    const amount = isPrimary ? jobAmount : 0;
    const description = isPrimary ? String(request.problem_description || '') : '';

    doc.text(String(idx + 1), colX.sno, y + 14);
    wrapAndAdvance(svc, colX.service, colWidths.service, 10);
    wrapAndAdvance(description, colX.description, colWidths.description, 10);
    doc.text(formatRupees(amount), colX.amount, y + 14);

    doc.setDrawColor(...hexToRgb(lightBorder));
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 22;
  });

  y += 6;
  checkPage(40);

  const totalsX = pageWidth - marginX - 140;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(slateText));
  doc.text('SUBTOTAL', totalsX, y);
  doc.text(formatRupees(jobAmount), pageWidth - marginX - 10, y, { align: 'right' });
  y += 16;
  doc.text('TOTAL', totalsX, y);
  doc.setFontSize(11);
  doc.setTextColor(...hexToRgb(totalGreen));
  doc.text(formatRupees(jobAmount), pageWidth - marginX - 10, y, { align: 'right' });
  y += 28;

  drawHorizontalLine();
  y += 14;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(brandGreen));
  doc.text('Thank you!', marginX, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(slateText));
  doc.text('We appreciate your business.', marginX, y);

  const sigX = pageWidth - marginX - 160;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(brandNavy));
  doc.text('Authorized Signature', sigX, y - 14);
  doc.setDrawColor(...hexToRgb(lightBorder));
  doc.line(sigX, y, sigX + 160, y);

  y = Math.min(y + 50, pageHeight - marginBottom - 70);

  doc.setFillColor(...hexToRgb(brandNavy));
  doc.rect(marginX, y, contentWidth, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CALL OR WHATSAPP', marginX + 12, y + 22);
  doc.setFontSize(18);
  doc.text('0309 9018308', marginX + 12, y + 42);

  const greenBoxX = pageWidth - marginX - 110;
  doc.setFillColor(...hexToRgb(brandGreen));
  doc.rect(greenBoxX, y, 110, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('WE COME,', greenBoxX + 55, y + 22, { align: 'center' });
  doc.text('YOU RELAX!', greenBoxX + 55, y + 40, { align: 'center' });

  return doc.output('blob');
}
