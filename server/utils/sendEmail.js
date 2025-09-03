const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const handlebarsHelpers = require("./handlebarsHelpers");
const fs = require("fs");
const path = require("path");

const sendEmail = async (email, subject, payload, template) => {
  try {
    console.log("=== EMAIL SEND DEBUG ===");
    console.log("Starting email send process to:", email);
    console.log("Subject:", subject);
    console.log("Template:", template);
    console.log("Payload keys:", Object.keys(payload));
    
    // Create a more detailed transporter with better logging
    // Email transporter setup using your format
    // Email transporter setup using your format
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      secure: false,
      port: 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    // Verify connection configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Read the email template
    const templatePath = path.join(__dirname, "..", "template", path.basename(template));
    console.log("Using template path:", templatePath);
    const source = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = handlebars.compile(source);
    
    // Set up email data with more detailed options
    const options = {
      from: `"Agency Overview" <${process.env.SMTP_USER_EMAIL}>`,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
      headers: {
        'priority': 'high'
      }
    };

    console.log("Sending email with options:", {
      from: options.from,
      to: options.to,
      subject: options.subject
    });

    // Send email
    const info = await transporter.sendMail(options);
    console.log(`Email sent: ${info.messageId}`);
    console.log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
