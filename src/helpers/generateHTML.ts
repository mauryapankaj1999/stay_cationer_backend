const generateHTML = (title: string, content: string, style = ""): string => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${title}
    ${style}
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
     <!-- <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
       <tr>
       <td align="center" style="padding: 20px 0;"> -->
           <!-- Main Content Wrapper -->
          ${content}
        <!-- </td>
      </tr>
    </table> -->
  </body>
  </html>`;
};

export default generateHTML;
