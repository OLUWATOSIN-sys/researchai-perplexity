import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chatHistory } = req.body;
    const doc = new PDFDocument();
    
    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    
    // Pipe PDF directly to response
    doc.pipe(res);
    
    // Add content
    doc.font('Helvetica-Bold').text('Chat History', { align: 'center' });
    chatHistory.forEach(msg => {
      doc.text(`${msg.role}: ${msg.content}`).moveDown();
    });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'PDF generation failed' });
  }
}