import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";
import { OrderObject } from "../types/invoice";
import moment from "moment";
import { User } from "models/user.model";

/**
 * Creates or updates a PDF invoice from order data and saves it to the specified path
 * @param orderObj Order data containing customer and item information
 * @param pdfUrl Path where the PDF will be saved
 * @returns Path to the generated PDF file
 */

// Constants
const DEFAULT_COMPANY_DATA = {
  name: "SAYERET BUSINESS SOLUTIONS PVT.LTD.",
  contactPerson: "Vishal Sharma",
  addressLine1: "RA-47, Third Floor Back Side",
  addressLine2: "Inderpuri",
  city: "Delhi",
  country: "India",
  gstin: "07ABACS5624E1ZK",
  logo: "public/logoMain.png",
};

const PDF_CONFIG = {
  margin: 20,
  size: "A4" as const,
  layout: "portrait" as const,
  lineHeight: 20,
  logoWidth: 200,
};

const TABLE_CONFIG = {
  top: 360,
  width: 555,
  rowHeight: 30,
  headerHeight: 30,
  columns: [
    { header: "#", width: 40, align: "center" as const },
    { header: "Property Name", width: 140, align: "left" as const },
    { header: "HSN/SAC", width: 60, align: "center" as const },
    { header: "Days", width: 60, align: "center" as const },
    { header: "Rate", width: 60, align: "center" as const },
    { header: "SGST", width: 60, align: "center" as const },
    { header: "CGST", width: 60, align: "center" as const },
    { header: "Amount", width: 60, align: "center" as const },
  ],
};

// Utility functions
export function calculateCGSTSGST(totalGST: number): { cgst: number; sgst: number } {
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;
  return { cgst, sgst };
}

export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  // Always count at least 1 day if end > start
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  } catch (e) {
    return "Invalid Date";
  }
}

function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function removeExistingFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// PDF content creation functions
function addCompanyHeader(doc: PDFKit.PDFDocument, orderObj: OrderObject): number {
  const logoPath = orderObj.companyLogo || DEFAULT_COMPANY_DATA.logo;
  doc.image(logoPath, PDF_CONFIG.margin, 40, { width: PDF_CONFIG.logoWidth });

  let yPos = 130;
  const companyName = orderObj.companyName || DEFAULT_COMPANY_DATA.name;
  doc.fontSize(12).text(companyName, PDF_CONFIG.margin, yPos);
  yPos += PDF_CONFIG.lineHeight;

  doc.fontSize(11);
  const companyDetails = [
    orderObj.companyContactPerson || DEFAULT_COMPANY_DATA.contactPerson,
    orderObj.companyAddressLine1 || DEFAULT_COMPANY_DATA.addressLine1,
    orderObj.companyAddressLine2 || DEFAULT_COMPANY_DATA.addressLine2,
    orderObj.companyCity || DEFAULT_COMPANY_DATA.city,
    orderObj.companyCountry || DEFAULT_COMPANY_DATA.country,
    `GSTIN ${orderObj.companyGSTIN || DEFAULT_COMPANY_DATA.gstin}`,
  ];

  // companyDetails.forEach((detail) => {
  //   doc.text(detail, PDF_CONFIG.margin, yPos);
  //   yPos += PDF_CONFIG.lineHeight;
  // });

  return yPos;
}

function addInvoiceTitle(doc: PDFKit.PDFDocument): void {
  doc.fontSize(24).text("TAX INVOICE", 375, 50, { align: "right", width: 200 });
}

function addBillingInfo(doc: PDFKit.PDFDocument, orderObj: OrderObject): void {
  let yPos = 300;
  doc.fontSize(12).text("Bill To:", PDF_CONFIG.margin, yPos);
  yPos += PDF_CONFIG.lineHeight + 5;

  doc.fontSize(11);
  const billingDetails = [orderObj.name || "", orderObj.city || "", orderObj.state || "", orderObj.country || ""];

  billingDetails.forEach((detail) => {
    if (detail) {
      doc.text(detail, PDF_CONFIG.margin, yPos);
      yPos += PDF_CONFIG.lineHeight;
    }
  });
}

function addInvoiceDetails(doc: PDFKit.PDFDocument, orderObj: OrderObject, role: any): void {
  const invoiceDate = moment(orderObj?.createdAt).format("YYYY-MM-DD");
  const dueDate = moment(orderObj.endDate)
    .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    .format("YYYY-MM-DD");
  // Commission (new addition)
  if (role === "SELLER") {
    doc
      .fontSize(11)
      .text("Commission :", 440, 300)
      .text(`${orderObj.commission || "N/A"}`, 515, 300);
  }
  doc
    .fontSize(11)
    // Invoice Date
    .text("Invoice Date :", 440, 320)
    .text(invoiceDate, 515, 320)

    // Due Date
    .text("Due Date :", 440, 340)
    .text(dueDate, 515, 340);
}

function calculateTablePositions(): number[] {
  let xPos = PDF_CONFIG.margin;
  return TABLE_CONFIG.columns.map((col) => {
    const pos = xPos;
    xPos += col.width;
    return pos;
  });
}

function addTableHeader(doc: PDFKit.PDFDocument, positions: number[]): void {
  // Draw header background
  doc
    .fillColor("#e56e18")
    .rect(PDF_CONFIG.margin, TABLE_CONFIG.top, TABLE_CONFIG.width, TABLE_CONFIG.headerHeight)
    .fill();

  // Add header text
  doc.fillColor("white").fontSize(11);
  TABLE_CONFIG.columns.forEach((col, i) => {
    doc.text(col.header, positions[i], TABLE_CONFIG.top + 8, {
      width: col.width,
      align: col.align,
    });
  });
}

function addTableRows(doc: PDFKit.PDFDocument, orderObj: OrderObject, positions: number[]): void {
  const { cgst, sgst } = calculateCGSTSGST(orderObj.gst?.amount || 0);
  const days = calculateDaysBetween(
    moment(orderObj.startDate).format("YYYY-MM-DD"),
    moment(orderObj.endDate).format("YYYY-MM-DD"),
  );
  console.log("orderObj", JSON.stringify(days, null, 2));

  if (!orderObj.hotelsArr?.length) return;

  doc.fillColor("black");

  orderObj.hotelsArr.forEach((hotel, index) => {
    const dailyRate = days > 0 ? Number(orderObj.gst?.baseAmount ?? 0) / days : 0;

    const rowData = [
      (index + 1).toString(),
      hotel.name || "N/A",
      hotel.hsnSac || "N/A",
      days > 0 ? String(days) : "0",
      dailyRate.toFixed(2),
      sgst.toFixed(2),
      cgst.toFixed(2),
      (orderObj.gst?.baseAmount || 0).toString(),
    ];

    const rowY = TABLE_CONFIG.top + TABLE_CONFIG.headerHeight + 8 + index * TABLE_CONFIG.rowHeight;

    rowData.forEach((text, i) => {
      doc.text(text, positions[i], rowY, {
        width: TABLE_CONFIG.columns[i].width,
        align: TABLE_CONFIG.columns[i].align,
      });
    });
  });

  // Draw bottom border
  const bottomY = TABLE_CONFIG.top + TABLE_CONFIG.headerHeight + orderObj.hotelsArr.length * TABLE_CONFIG.rowHeight + 8;
  doc
    .moveTo(PDF_CONFIG.margin, bottomY)
    .lineTo(PDF_CONFIG.margin + TABLE_CONFIG.width, bottomY)
    .stroke();
}

function addBookingDates(doc: PDFKit.PDFDocument, orderObj: OrderObject): void {
  const bookingY = 240;
  const startDate = orderObj?.startDate ? new Date(orderObj.startDate) : new Date();
  startDate.setHours(startDate.getHours() + 5); // Ensure startDate is at the beginning of the day
  startDate.setMinutes(startDate.getMinutes() + 30); // Ensure startDate is at the beginning of the day
  // date1.setHours(0, 0, 0, 0);
  const endDate = orderObj?.endDate ? new Date(orderObj.endDate) : new Date();
  endDate.setHours(endDate.getHours() + 5); // Ensure startDate is at the beginning of the day
  endDate.setMinutes(endDate.getMinutes() + 30); // Ensure startDate is at the beginning of the day

  // TABLE_CONFIG.top + TABLE_CONFIG.headerHeight + (orderObj.hotelsArr?.length || 0) * TABLE_CONFIG.rowHeight + 130;

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(`Start Date: ${moment(startDate).format("DD-MM-YY")}`, PDF_CONFIG.margin, bookingY)
    .text(`End Date: ${moment(endDate).format("DD-MM-YY")}`, PDF_CONFIG.margin, bookingY + 20);
}

function addTotalsSection(doc: PDFKit.PDFDocument, orderObj: OrderObject): void {
  const totalsX = 450;
  const totalsLabelX = 350;
  const totalsStart = TABLE_CONFIG.top + 85;
  const spacing = 25;
  const { sgst, cgst } = calculateCGSTSGST(orderObj.gst?.amount || 0);
  // Sub Total
  // doc.text("Sub Total", totalsLabelX, totalsStart).text(`${orderObj.gst?.baseAmount || "0.00"}`, totalsX, totalsStart, {
  //   align: "right",
  //   width: 100,
  // });

  // CGST
  doc
    .text(`CGST`, totalsLabelX, totalsStart)
    .text(
      `${cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalsX,
      totalsStart,
      {
        align: "right",
        width: 100,
      },
    );

  //SGST
  doc
    .text(`SGST`, totalsLabelX, totalsStart + spacing)
    .text(
      `${sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalsX,
      totalsStart + spacing,
      {
        align: "right",
        width: 100,
      },
    );

  // Total
  const totalAmount = Number(orderObj.gst?.baseAmount) + (cgst + sgst) || 0;
  doc
    .font("Helvetica-Bold")
    .text("TOTAL", totalsLabelX, totalsStart + spacing * 2)
    .text(
      `Rs.${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalsX,
      totalsStart + spacing * 2,
      {
        align: "right",
        width: 100,
      },
    );
}

function addNotesAndTerms(doc: PDFKit.PDFDocument, orderObj: OrderObject): void {
  const notesStart = TABLE_CONFIG.top + 185;

  // Notes section
  doc
    .font("Helvetica")
    .fontSize(12)
    .text("Notes", PDF_CONFIG.margin, notesStart)
    .fontSize(11)
    .text(orderObj.adminNote || "It was great doing business with you.", PDF_CONFIG.margin, notesStart + 25);

  // Terms & Conditions
  doc
    .fontSize(12)
    .text("Terms & Conditions", PDF_CONFIG.margin, notesStart + 70)
    .fontSize(11)
    .text(
      orderObj.termsAndConditions || "Please make the payment by the due date.",
      PDF_CONFIG.margin,
      notesStart + 95,
    );
}

export const createInvoice = async (orderObj: OrderObject, pdfUrl: string, role: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // File management
      removeExistingFile(pdfUrl);
      ensureDirectoryExists(pdfUrl);

      // Create PDF document
      const doc = new PDFDocument(PDF_CONFIG);
      const stream = fs.createWriteStream(pdfUrl);
      doc.pipe(stream);

      // Set default font
      doc.font("Helvetica");

      // Build PDF content
      addCompanyHeader(doc, orderObj);
      addInvoiceTitle(doc);
      addBillingInfo(doc, orderObj);
      addInvoiceDetails(doc, orderObj, role);

      // Table section
      const positions = calculateTablePositions();
      addTableHeader(doc, positions);
      addTableRows(doc, orderObj, positions);

      // Add booking dates below table
      addBookingDates(doc, orderObj);

      // Final sections
      addTotalsSection(doc, orderObj);
      // addNotesAndTerms(doc, orderObj);

      // Finalize PDF
      doc.end();

      stream.on("finish", () => resolve(pdfUrl));
      stream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
