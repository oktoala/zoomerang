import nodemailer from 'nodemailer';

export const emailTransport = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: 'generateai@myevents.id',
    pass: 'generateai@admin'
  }
});
