const cron = require('node-cron');
const OutOfOffice = require('./OutOfOffice');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const secrets = require('./secrets');

// cron.schedule('0 8 * * *', () => {
cron.schedule('* * * * *', () => {
    OutOfOffice.find({ emailSent: false }, (err, requests) => {
        if(err) throw err;
        let today = moment().format("dddd, MMMM Do YYYY");

        requests.map(request => {
            if (today === request.date && !request.emailSent) {
                request.emailSent = true;
                request.save((err, result) => {
                    if (err) throw err;

                    sgMail.setApiKey(secrets.EMAIL_KEY);
                    const msg = {
                        to: secrets.TO_EMAIL,
                        from: secrets.FROM_EMAIL,
                        subject: 'Out of Office Reminder',
                        html:
                            `<strong>***This is an automated message***</strong>
                            <p>This is a reminder that Max will be out of the office today from ${request.fromTime} to ${request.toTime}.</p>
                            <div style="border: 2px solid #ccc; padding: 20px; width: 40%;">
                            <h4 style="margin: 0px;">REASON</h4>
                            <p style="">${request.reason}</p>
                            </div>
                            <p>If you have any questions or concerns, please reply to this email.</p>
                            <p>Regards,</p>
                            <p>Max's "Out-of-Office-Bot"</p>`
                    };
                    sgMail.send(msg);
                })
            }
        })
    })
}, { scheduled: true, timezone: "America/Denver" });
