import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    const { chatHistory } = req.body;
    
    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'chatHistory must be provided as an array'
      });
    }

    const doc = new PDFDocument();
    
    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=chat-history-report.pdf');
    
    // Pipe PDF directly to response
    doc.pipe(res);
    
    // Add title and metadata
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text('Chat History Report', { align: 'center' })
       .moveDown(0.5);
    
    doc.font('Helvetica')
       .fontSize(10)
       .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
       .moveDown(2);
    
    // Add chat history content
    chatHistory.forEach((msg, index) => {
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text(`${msg.role.toUpperCase()}:`)
         .moveDown(0.2);
      
      doc.font('Helvetica')
         .fontSize(10)
         .text(msg.content)
         .moveDown(1);
      
      // Add page break if not last message
      if (index < chatHistory.length - 1) {
        doc.addPage();
      }
    });
    
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'PDF generation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}