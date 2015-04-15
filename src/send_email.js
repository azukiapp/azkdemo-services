var transporter = null;

if (process.env.MAIL_SMTP_HOST) {
  var nodemailer = require('nodemailer');
  var smtpTransport = require('nodemailer-smtp-transport');

  transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: process.env.MAIL_SMTP_PORT,
    ignoreTLS: true
  }));
}

module.exports = function(req, response) {
  if (transporter) {
    var mail = {
      from: 'youremail@email.com',
      to: 'youremail@email.com',
      subject: 'test',
      text: 'hello world!!!!'
    };

    transporter.sendMail(mail, function(err, mailResult) {
      var msg = 'E-mail sent to ' + mail.from;
      response.end(msg);
    });
  } else {
    response.end('mail not active, try azk start mail');
    console.log('transporter:', transporter);
    console.log('process.env.MAIL_SMTP_HOST:', process.env.MAIL_SMTP_HOST);
    console.log('process.env.MAIL_SMTP_PORT:', process.env.MAIL_SMTP_PORT);
  }
}
