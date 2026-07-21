import { ChatMessageResult } from '../types';
import { showToast } from '../hooks/useToast';

export function exportAnalysisAsJSON(messageText: string, result?: ChatMessageResult) {
  const exportData = {
    platform: 'Citizen Fraud Shield (CFS)',
    exportedAt: new Date().toISOString(),
    originalMessage: messageText,
    verdict: result?.prediction || 'Unknown',
    confidenceScore: result?.confidence || 0,
    riskLevel: result?.risk || 'Low',
    triggeredIndicators: result?.triggeredSignals || [],
    explanation: result?.explanation || '',
    recommendedActions: result?.recommendedActions || [],
    language: result?.language || 'en',
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = dataStr;
  downloadAnchor.download = `CFS_Scam_Report_${Date.now()}.json`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast({ type: 'success', title: 'Export Complete', message: 'Report exported as JSON file.' });
}

export function exportAnalysisAsTXT(messageText: string, result?: ChatMessageResult) {
  const content = `=====================================================
CITIZEN FRAUD SHIELD — AI SCAM ANALYSIS REPORT
=====================================================
Generated At: ${new Date().toLocaleString()}
Verdict: ${result?.prediction || 'Suspicious'}
Confidence Score: ${result?.confidence || 0}%
Risk Level: ${result?.risk || 'High'}
Language: ${result?.language || 'English'}

-----------------------------------------------------
ORIGINAL MESSAGE CONTENT:
"${messageText}"

-----------------------------------------------------
TRIGGERED FRAUD INDICATORS:
${result?.triggeredSignals?.map((s) => `• ${s}`).join('\n') || 'None'}

-----------------------------------------------------
EXPLAINABLE AI REASONING:
${result?.explanation || 'N/A'}

-----------------------------------------------------
RECOMMENDED SAFETY ACTIONS:
${result?.recommendedActions?.map((a) => `• ${a}`).join('\n') || 'N/A'}

=====================================================
National Cyber Crime Portal Reference Helpline: 1930
=====================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CFS_Scam_Report_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast({ type: 'success', title: 'Export Complete', message: 'Report exported as Plain Text (.txt).' });
}

export function exportAnalysisAsPDF(messageText: string, result?: ChatMessageResult) {
  // Generate HTML canvas / printable PDF page
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    exportAnalysisAsTXT(messageText, result);
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Citizen Fraud Shield Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
    .header { border-bottom: 2px solid #4f378a; padding-bottom: 15px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #4f378a; }
    .subtitle { font-size: 12px; color: #64748b; font-family: monospace; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; margin-top: 10px; }
    .scam { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .legit { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
    h3 { font-size: 14px; margin-top: 0; color: #334155; text-transform: uppercase; font-family: monospace; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 6px; font-size: 13px; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; pt: 10px; font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CITIZEN FRAUD SHIELD</div>
    <div class="subtitle">NATIONAL CYBER FRAUD DETECTION & RESPONSE GRID — INCIDENT REPORT</div>
    <div class="badge ${result?.prediction === 'Scam' ? 'scam' : 'legit'}">
      VERDICT: ${result?.prediction === 'Scam' ? '⚠ SCAM DETECTED' : '✔ LEGITIMATE COMMUNICATION'} (${result?.confidence || 0}% CONFIDENCE)
    </div>
  </div>

  <div class="box">
    <h3>Original Message Submitted</h3>
    <p style="font-family: monospace; font-size: 13px;">"${messageText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</p>
  </div>

  <div class="box">
    <h3>Triggered Scam Indicators</h3>
    <ul>
      ${result?.triggeredSignals?.map((s) => `<li><strong>${s}</strong></li>`).join('') || '<li>None</li>'}
    </ul>
  </div>

  <div class="box">
    <h3>Explainable AI Reasoning</h3>
    <p style="font-size: 13px; line-height: 1.6;">${result?.explanation || 'N/A'}</p>
  </div>

  <div class="box">
    <h3>Recommended Safety Actions</h3>
    <ul>
      ${result?.recommendedActions?.map((a) => `<li>${a}</li>`).join('') || '<li>N/A</li>'}
    </ul>
  </div>

  <div class="footer">
    Report Timestamp: ${new Date().toLocaleString()} | Reference ID: CFS-${Date.now()} | Cyber Crime Helpline: 1930
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  showToast({ type: 'success', title: 'PDF Ready', message: 'Opening printable PDF report.' });
}

export function generateOfficialCyberCrimeReport(messageText: string, result?: ChatMessageResult) {
  const content = `======================================================================
FORMAL CYBER CRIME INCIDENT SUMMARY REPORT (CIVILIAN SUBMISSION)
======================================================================
Generated via Citizen Fraud Shield (CFS) Platform
Timestamp: ${new Date().toISOString()}
Document Ref: CFS-INCIDENT-${Math.floor(100000 + Math.random() * 900000)}

----------------------------------------------------------------------
1. INCIDENT METRICS
----------------------------------------------------------------------
Threat Assessment: ${result?.prediction === 'Scam' ? 'SCAM / FRAUDULENT SOLICITATION' : 'UNVERIFIED'}
Confidence Rating: ${result?.confidence || 0}%
Severity Rating: ${result?.risk || 'High'}
District Location: Citizen Logged Incident

----------------------------------------------------------------------
2. EVIDENTIARY TEXT CONTENT
----------------------------------------------------------------------
"${messageText}"

----------------------------------------------------------------------
3. DETECTED CYBER THREAT INDICATORS
----------------------------------------------------------------------
${result?.triggeredSignals?.map((s, i) => `[${i + 1}] ${s}`).join('\n') || 'None'}

----------------------------------------------------------------------
4. EXPLAINABLE AI ANALYSIS & EVIDENCE SUMMARY
----------------------------------------------------------------------
${result?.explanation || 'N/A'}

----------------------------------------------------------------------
5. RECOMMENDED EVIDENCE FOR LAW ENFORCEMENT
----------------------------------------------------------------------
• Preserve original SMS/WhatsApp message screenshots with visible phone number/sender ID.
• Save UPI transaction IDs or bank account details referenced in solicitation.
• Do not click or open URL links contained in message.
• File official report at National Cyber Crime Reporting Portal (cybercrime.gov.in) or call 1930.

======================================================================
End of Incident Record | Citizen Fraud Shield Intelligence Grid
======================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Cyber_Crime_Incident_Report_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast({ type: 'success', title: 'Cyber Crime Report Generated', message: 'Formal incident summary file downloaded.' });
}
