import type { TimeRange } from '../model/types';

/**
 * Analytics export utilities
 * Pure functions for PDF and Excel/CSV report generation
 */

export interface ExportPDFOptions {
  timeRange: TimeRange;
  topSellingItems: Array<{ itemName: string; orders: number }>;
}

export interface ExportExcelOptions {
  topSellingItems: Array<{ itemName: string; orders: number }>;
}

/**
 * Generates and prints an HTML-based PDF report
 */
export function exportAnalyticsPDF(options: ExportPDFOptions): void {
  const { timeRange, topSellingItems } = options;

  const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Analytics Report - TKOB Restaurant</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 40px;
            color: #111827;
          }
          h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #111827;
          }
          .subtitle {
            font-size: 15px;
            color: #6B7280;
            margin-bottom: 32px;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin-bottom: 32px;
          }
          .kpi-card {
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            background: white;
          }
          .kpi-title {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 8px;
          }
          .kpi-value {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
          }
          .kpi-trend {
            font-size: 13px;
            color: #10B981;
          }
          h2 {
            font-size: 22px;
            font-weight: 700;
            margin-top: 32px;
            margin-bottom: 16px;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            text-align: left;
            padding: 12px;
            background: #F9FAFB;
            border-bottom: 2px solid #E5E7EB;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 14px;
            color: #111827;
          }
          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px solid #E5E7EB;
            font-size: 13px;
            color: #6B7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Analytics Report</h1>
        <div class="subtitle">TKOB Restaurant • ${timeRange} • Generated on ${new Date().toLocaleDateString()}</div>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Total Revenue</div>
            <div class="kpi-value">$28,450</div>
            <div class="kpi-trend">↑ 15% from last period</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Total Orders</div>
            <div class="kpi-value">1,248</div>
            <div class="kpi-trend">↑ 12% from last period</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Avg Order Value</div>
            <div class="kpi-value">$22.79</div>
            <div class="kpi-trend">↑ 3% from last period</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Avg Prep Time</div>
            <div class="kpi-value">14 min</div>
            <div class="kpi-trend" style="color: #EF4444;">↓ 2 min from last period</div>
          </div>
        </div>

        <h2>Top Selling Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th style="text-align: right;">Orders</th>
            </tr>
          </thead>
          <tbody>
            ${topSellingItems.map(item => `
              <tr>
                <td>${item.itemName}</td>
                <td style="text-align: right; font-weight: 600;">${item.orders}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Summary Insights</h2>
        <table>
          <tbody>
            <tr>
              <td style="font-weight: 600;">Most Ordered Item</td>
              <td>Margherita Pizza (145 orders)</td>
            </tr>
            <tr>
              <td style="font-weight: 600;">Busiest Day</td>
              <td>Saturday (Avg 95 orders/day)</td>
            </tr>
            <tr>
              <td style="font-weight: 600;">Peak Hour</td>
              <td>7 PM (Avg 65 orders/hour)</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          This report was generated by TKQR Analytics on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Generates and downloads a CSV/Excel report
 */
export function exportAnalyticsExcel(options: ExportExcelOptions): void {
  const { topSellingItems } = options;

  // Create CSV content from popular items
  let csvContent = 'Item Name,Orders\n';
  topSellingItems.forEach(item => {
    csvContent += `"${item.itemName}",${item.orders}\n`;
  });

  // Add summary section
  csvContent += '\n\nSummary Insights\n';
  csvContent += 'Metric,Value\n';
  csvContent += '"Most Ordered Item","Margherita Pizza (145 orders)"\n';
  csvContent += '"Busiest Day","Saturday (Avg 95 orders/day)"\n';
  csvContent += '"Peak Hour","7 PM (Avg 65 orders/hour)"\n';
  csvContent += '\n\nKPI Metrics\n';
  csvContent += 'Metric,Value,Trend\n';
  csvContent += '"Total Revenue","$28,450","↑ 15% from last period"\n';
  csvContent += '"Total Orders","1,248","↑ 12% from last period"\n';
  csvContent += '"Avg Order Value","$22.79","↑ 3% from last period"\n';
  csvContent += '"Avg Prep Time","14 min","↓ 2 min from last period"\n';

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
