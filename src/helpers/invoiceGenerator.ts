import { sub } from "date-fns";

const invoiceGenerator = (userData: any) => {
    const { name, email, mobile, paymentObj, startDate, endDate, hotelsArr, totalAmount,subTotalAmount, gst, commission, adult, child } = userData;
    const propertyName = hotelsArr[0]?.name || "N/A"; 
    const subtotal = subTotalAmount;
  const gstAmount = gst.amount; 
  const bookingTotal = gst.baseAmount  + gst.amount;
  
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f0f2f5;
              color: #333;
          }
          .container {
              width: 80%;
              max-width: 900px;
              margin: 40px auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 16px;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
              transition: transform 0.2s ease-in-out;
          }
          .container:hover {
              transform: translateY(-5px);
          }
          .header {
              background: linear-gradient(135deg, #e74c3c, #c0392b);
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: 600;
              border-radius: 12px 12px 0 0;
              letter-spacing: 1px;
          }
          .info {
              display: flex;
              justify-content: space-between;
              padding: 20px;
              background: #f9fafb;
              border-radius: 10px;
              margin: 20px 0;
              border: 1px solid #e5e7eb;
          }
          .info div {
              width: 48%;
              font-size: 15px;
              line-height: 1.6;
          }
          .info strong {
              color: #2c3e50;
              font-weight: 600;
          }
          .table-container {
              margin: 20px 0;
          }
          table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              background: #fff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          }
          th, td {
              padding: 16px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
          }
          th {
              background: linear-gradient(135deg, #e74c3c, #c0392b);
              color: white;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 13px;
              letter-spacing: 0.5px;
          }
          td {
              font-size: 14px;
              color: #555;
          }
          tr:last-child td {
              border-bottom: none;
          }
          tr:hover td {
              background: #f9fafb;
              transition: background 0.2s ease;
          }
          .total {
              text-align: right;
              padding: 25px;
              font-size: 16px;
              background: #f9fafb;
              border-radius: 10px;
              margin-top: 20px;
              border: 1px solid #e5e7eb;
              line-height: 1.8;
          }
          .total strong {
              font-size: 18px;
              color: #e74c3c;
          }
          .total hr {
              border: none;
              border-top: 1px solid #d1d5db;
              margin: 10px 0;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 13px;
              color: #777;
              border-top: 1px solid #e5e7eb;
              margin-top: 20px;
          }
          a {
              color: #e74c3c;
              text-decoration: none;
              font-weight: 600;
              transition: color 0.2s ease;
          }
          a:hover {
              color: #c0392b;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">INVOICE</div>
          <div class="info">
              <div>
                  <strong>User Detail</strong><br>
                  Name: ${name}<br>
                  Email ID: ${email}<br>
                  Phone No: ${mobile}
              </div>
              <div>
                  <strong>Booking Detail</strong><br>
                  Order ID: ${paymentObj.gatwayPaymentObj.id}<br>
                  Booking Date: ${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}<br>
                  Invoice No: Staycation 29373368
              </div>
          </div>
          <div class="table-container">
              <table>
                  <tr>
                      <th>Property</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Destination</th>
                      <th>No. of Guests</th>
                      <th>Price</th>
                      <th>Discount</th>
                  </tr>
                  <tr>
                      <td>${propertyName}</td>
                      <td>${new Date(startDate).toDateString()}</td>
                      <td>${new Date(endDate).toDateString()}</td>
                      <td>${propertyName}</td>
                      <td>${parseInt(adult) + parseInt(child)}</td>
                      <td>₹${subTotalAmount

                      }</td>
                      <td>-₹0</td>
                  </tr>
              </table>
          </div>
          <div class="total">
            Subtotal: ₹${subtotal}<br>
            GST (IGST): ₹${gstAmount}<br>
            Discount: -₹0<br>
            <hr>
            <strong>Booking Total: ₹${totalAmount}</strong>
        </div>
          <div class="footer">
              Thank you for staying with us. We look forward to your next visit!<br>
              <strong>Account Visit <a href="https://Staycationer.com">Staycationer.com</a></strong>
          </div>
      </div>
  </body>
  </html>
    `;
  };
  
  export default invoiceGenerator;