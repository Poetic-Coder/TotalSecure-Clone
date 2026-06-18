import * as PDFDocument from 'pdfkit';
import { Logger } from '@nestjs/common';

const logger = new Logger('DocumentUtil');

export async function generateApplicationLetter(booking: any, agent: any): Promise<string> {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
  });

  const chunks: Buffer[] = [];

  const agentProfile = agent.profile || {};
  const agentUser = agent || {};
  const agentkyc = agent.kyc || {};
  const trip = booking.trip || {};
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer.toString('base64')); 
    });
    doc.on('error', (err) => {
      logger.error(`PDF generation failed for ${booking.groupRef}`, err);
      reject(err);
    });

    doc.font('Helvetica-Bold').fontSize(20).text(agentkyc.name, { align: 'center' });
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10).fillColor('#333333');
    doc.text(agentkyc.address || 'Address Not Available', { align: 'center' });
    doc.text(`Tel: ${agentUser.phone || 'N/A'} | Email: ${agentUser.email}`, { align: 'center' });
    doc.moveDown(2);

    // --- 2. Date and Recipient ---
    doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#eeeeee').stroke();
    doc.y = doc.y + 20;

    doc.fontSize(11);
    doc.text(`Date: ${generatedDate}`, { align: 'right' });
    doc.moveDown(1);
    doc.font('Helvetica-Bold').text('Saudia Group Booking Department', { align: 'left' });
    doc.font('Helvetica').text('Jeddah, Saudi Arabia', { align: 'left' });
    doc.moveDown(2);

    // --- 3. Subject Line ---
    doc.font('Helvetica-Bold').text('Subject: Group Booking Application', { align: 'left' });
    doc.font('Helvetica').text(`Reference ID: ${booking.groupRef}`);
    doc.moveDown(2);

    // --- 4. Salutation and Body ---
    doc.text('Dear Saudia Group Booking Team,', { align: 'left' });
    doc.moveDown();
    doc.text(
      `On behalf of our client, we are formally requesting a quotation and availability confirmation for a group booking. The details for this request are outlined below.`,
      { align: 'justify' }
    );
    doc.moveDown(1.5);

    // --- 5. Travel Details Section  ---
    const boxTop = doc.y;
    const boxWidth = doc.page.width - 120;
    doc.rect(60, boxTop - 10, boxWidth, 155).fill('#F3F4F6').strokeColor('#E5E7EB').lineWidth(0.5).stroke();
    doc.y = boxTop;
    
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12).text('Group Travel Request Details', 75, doc.y);
    doc.moveDown();
    doc.fontSize(10);
    
    const writeLine = (label: string, value: string) => {
      doc.font('Helvetica-Bold').text(label, 75, doc.y, { width: 140, continued: true }).font('Helvetica').text(value);
      doc.moveDown(0.7);
    };
    
     writeLine('Group Name:', booking.groupName);
      writeLine('Total Passengers:', booking.passengerCount.toString());
      writeLine('Flight Number:', trip.flightNumber || 'N/A');
      writeLine('Route:', `${trip.originCode || 'N/A'} → ${trip.destinationCode || 'N/A'}`);
      writeLine('Departure Date:', new Date(booking.travelDate).toUTCString());
      writeLine('Requested Class:', booking.requestedClass || 'N/A');
      
      doc.y = boxTop + 165; 


      // --- 6. Closing Remarks ---
      doc.font('Helvetica').fontSize(11).fillColor('#333333');
      doc.text(
        'We kindly request your team to review this application and provide us with a final quotation and payment terms at your earliest convenience. Please ensure that all future correspondence regarding this request includes our Reference ID in the subject line for efficient tracking.',
        { align: 'justify' }
      );
      doc.moveDown(2);


      // --- 7. Signature ---
      doc.text('Thank you for your partnership.');
      doc.moveDown(1);
      doc.text('Sincerely,');
      doc.moveDown(2.5);
      doc.font('Helvetica-Bold').text(`${agentProfile.firstName || ''} ${agentProfile.lastName || ''}`.trim());
      doc.font('Helvetica').text(agentkyc.name);


      // --- 8. Footer ---
      const pageBottom = doc.page.height - 50;
      doc.moveTo(60, pageBottom).lineTo(doc.page.width - 60, pageBottom).strokeColor('#eeeeee').stroke();
      doc.fontSize(8).fillColor('#6B7280');
      doc.text(`Document generated on: ${generatedDate}`, 60, pageBottom + 10);
      doc.text(`Ref: ${booking.groupRef}`, { align: 'right' });
      
      doc.end();
  });
}