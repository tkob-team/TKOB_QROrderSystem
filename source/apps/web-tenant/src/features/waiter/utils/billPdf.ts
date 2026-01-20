/**
 * Bill PDF Generator Utility
 * BUG-09/FEAT-13: Generate printable bill PDF for waiter interface
 * 
 * Uses browser's native printing capabilities to generate a printer-friendly bill.
 * Can also be used to download as PDF if browser supports it.
 */

export interface BillItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

export interface BillData {
  billNumber: string
  tableNumber: string
  tableId: string
  sessionId?: string
  createdAt: Date | string
  items: BillItem[]
  subtotal: number
  serviceCharge: number
  tax: number
  discount?: number
  tip?: number
  total: number
  paymentMethod?: string
  paymentStatus?: string
  tenantName?: string
  tenantAddress?: string
  tenantPhone?: string
  notes?: string
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate bill HTML content for printing
 */
export function generateBillHtml(bill: BillData): string {
  const itemsHtml = bill.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <div style="font-weight: 500;">${item.name}</div>
          ${item.notes ? `<div style="font-size: 12px; color: #666; font-style: italic;">Note: ${item.notes}</div>` : ''}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.total)}</td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bill #${bill.billNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding-bottom: 16px;
      border-bottom: 2px solid #333;
      margin-bottom: 16px;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 4px;
    }
    .header p {
      color: #666;
      font-size: 12px;
    }
    .bill-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #ccc;
    }
    .bill-info-item {
      text-align: center;
    }
    .bill-info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .bill-info-value {
      font-size: 16px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      text-align: left;
      padding: 8px 0;
      border-bottom: 2px solid #333;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    .totals {
      border-top: 2px solid #333;
      padding-top: 12px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .total-row.grand-total {
      font-size: 18px;
      font-weight: 700;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 2px solid #333;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      padding-top: 16px;
      border-top: 1px dashed #ccc;
    }
    .footer p {
      font-size: 12px;
      color: #666;
    }
    .payment-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .payment-badge.paid {
      background: #d1fae5;
      color: #059669;
    }
    .payment-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${bill.tenantName || 'Restaurant'}</h1>
    ${bill.tenantAddress ? `<p>${bill.tenantAddress}</p>` : ''}
    ${bill.tenantPhone ? `<p>Tel: ${bill.tenantPhone}</p>` : ''}
  </div>

  <div class="bill-info">
    <div class="bill-info-item">
      <div class="bill-info-label">Bill #</div>
      <div class="bill-info-value">${bill.billNumber}</div>
    </div>
    <div class="bill-info-item">
      <div class="bill-info-label">Table</div>
      <div class="bill-info-value">${bill.tableNumber}</div>
    </div>
    <div class="bill-info-item">
      <div class="bill-info-label">Date</div>
      <div class="bill-info-value" style="font-size: 12px;">${formatDate(bill.createdAt)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>${formatCurrency(bill.subtotal)}</span>
    </div>
    ${bill.serviceCharge > 0 ? `
    <div class="total-row">
      <span>Service Charge</span>
      <span>${formatCurrency(bill.serviceCharge)}</span>
    </div>
    ` : ''}
    ${bill.tax > 0 ? `
    <div class="total-row">
      <span>Tax</span>
      <span>${formatCurrency(bill.tax)}</span>
    </div>
    ` : ''}
    ${bill.discount && bill.discount > 0 ? `
    <div class="total-row" style="color: #059669;">
      <span>Discount</span>
      <span>-${formatCurrency(bill.discount)}</span>
    </div>
    ` : ''}
    ${bill.tip && bill.tip > 0 ? `
    <div class="total-row">
      <span>Tip</span>
      <span>${formatCurrency(bill.tip)}</span>
    </div>
    ` : ''}
    <div class="total-row grand-total">
      <span>TOTAL</span>
      <span>${formatCurrency(bill.total)}</span>
    </div>
  </div>

  <div class="footer">
    ${bill.paymentStatus ? `
    <span class="payment-badge ${bill.paymentStatus === 'COMPLETED' ? 'paid' : 'pending'}">
      ${bill.paymentStatus === 'COMPLETED' ? '✓ Paid' : 'Payment Pending'}
    </span>
    ` : ''}
    ${bill.paymentMethod ? `<p style="margin-top: 8px;">Payment: ${bill.paymentMethod.replace('_', ' ')}</p>` : ''}
    <p style="margin-top: 16px;">Thank you for dining with us!</p>
    ${bill.notes ? `<p style="margin-top: 8px; font-style: italic;">${bill.notes}</p>` : ''}
  </div>

  <div class="no-print" style="margin-top: 24px; text-align: center;">
    <button onclick="window.print()" style="padding: 12px 24px; background: #f97316; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
      🖨️ Print Bill
    </button>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Open bill in a new window for printing
 */
export function printBill(bill: BillData): void {
  const html = generateBillHtml(bill)
  const printWindow = window.open('', '_blank', 'width=450,height=600')
  
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus()
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  } else {
    alert('Could not open print window. Please enable popups for this site.')
  }
}

/**
 * Download bill as HTML file (can be printed to PDF by browser)
 */
export function downloadBillHtml(bill: BillData): void {
  const html = generateBillHtml(bill)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `bill-${bill.billNumber}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
