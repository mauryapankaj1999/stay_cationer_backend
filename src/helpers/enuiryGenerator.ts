const enquiryGenerator = (name: string, userData: any) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enquiry Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .content p {
            margin: 10px 0;
            line-height: 1.6;
        }
        .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Enquiry Received</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for submitting your enquiry. We have successfully received your details and will get back to you soon.</p>
            <h3>Your Enquiry Details:</h3>
            <div class="details">
              ${userData}
            </div>
            <p>If you have any further questions, feel free to contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>
            <p>Best regards,<br>Your Company Name</p>
        </div>
        </div>
        </body>
        </html>`;
};

export default enquiryGenerator;
// <div class="footer">
//     <p>&copy; 2025 Your Company Name. All rights reserved.</p>
//     <p><a href="https://yourdomain.com">Visit our website</a> | <a href="https://yourdomain.com/unsubscribe">Unsubscribe</a></p>
// </div>
