const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "usama@abbcfoundation.com",
    subject: "Welcome to Task Manager APP!!",
    text: `Welcome ${name}!!`,
  });
};

module.exports = {
  sendWelcomeEmail,
};
