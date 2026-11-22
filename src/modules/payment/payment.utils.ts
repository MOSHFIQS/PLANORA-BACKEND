import PDFDocument from "pdfkit";

export interface EventInvoiceData {
  invoiceId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  eventDate: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
}

export const generateEventInvoicePdf = async (data: EventInvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const drawDivider = () => doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown();

      // Title & Subtitle
      doc.fontSize(22).font("Helvetica-Bold").text("EVENT INVOICE", { align: "center" }).moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text("Event Management System", { align: "center" }).moveDown();
      drawDivider();

      // Sections
      const addSection = (title: string, lines: string[]) => {
        doc.fontSize(11).font("Helvetica-Bold").text(title);
        doc.fontSize(10).font("Helvetica");
        lines.forEach((line) => doc.text(line));
        doc.moveDown();
      };

      addSection("Invoice Details", [
        `Invoice ID: ${data.invoiceId}`,
        `Transaction ID: ${data.transactionId}`,
        `Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`,
      ]);

      addSection("User Details", [
        `Name: ${data.userName}`,
        `Email: ${data.userEmail}`,
      ]);

      addSection("Event Details", [
        `Event Name: ${data.eventName}`,
        `Event Date: ${new Date(data.eventDate).toLocaleDateString()}`,
      ]);

      drawDivider();

      // Summary & Total
      doc.fontSize(11).font("Helvetica-Bold").text("Payment Summary");
      doc.fontSize(10).font("Helvetica").text(`Amount: ${data.amount.toFixed(2)} BDT`).moveDown();
      doc.fontSize(11).font("Helvetica-Bold").text(`Total: ${data.amount.toFixed(2)} BDT`).moveDown(2);

      doc.fontSize(9).font("Helvetica").text("Thank you for your payment.", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
