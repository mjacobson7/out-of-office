const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const secrets = require('./secrets');
const OutOfOffice = require('./OutOfOffice');
const moment = require('moment-timezone');
require('./cron');




//Express Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


//DB Connection
mongoose.connect(secrets.DATABASE_URL, { useNewUrlParser: true });

app.get('/getCurrentRequests', (req, res) => {
    OutOfOffice.find({ emailSent: false }, (err, requests) => {
        if (err) throw err;
        res.status(200).json(requests);
    })
})

app.put('/cancelRequest/:id', (req, res) => {

    OutOfOffice.findById({ _id: req.params.id }, (err, request) => {
        sgMail.setApiKey(secrets.EMAIL_KEY);
        const msg = {
            to: secrets.TO_EMAIL,
            from: secrets.FROM_EMAIL,
            subject: 'CANCELLED - Out of Office Request',
            html:
                `<strong>***This is an automated message***</strong>
                <h1><strong>The request below has been cancelled - please disregard</strong></h1>
                <p>Max has requested to be excused on ${request.date} from ${request.fromTime} to ${request.toTime}</p>
                <div style="border: 2px solid #ccc; padding: 20px; width: 40%;">
                <h4 style="margin: 0px;">REASON</h4>
                <p style="">${request.reason}</p>
                </div>
                <p>If you have any questions or concerns, please reply to this email.</p>
                <p>Regards,</p>
                <p>Max's "Out-of-Office-Bot"</p>`
        };
        sgMail.send(msg);

        OutOfOffice.deleteOne({ _id: request.id }, (err) => {
            if (err) throw err;
            res.status(200).json();
        })
    })
})


app.post('/submitForm', (req, res) => {
    console.log('submitted!')
    let { date, fromTime, toTime, reason } = req.body;

    date = moment(date).format("dddd, MMMM Do YYYY");
    fromTime = parseTime(fromTime);
    toTime = parseTime(toTime);

    function parseTime(time) {
        let hours = parseInt(time);
        let minutes = time.substring(3, 5);

        if (hours > 12) {
            return `${hours - 12}:${minutes} PM`;
        } else if (hours == 0) {
            return `12:${minutes} AM`;
        } else {
            return `${hours}:${minutes} AM`;
        }
    }

    const today = moment().tz("America/Denver").format("dddd, MMMM Do YYYY");
    const request = new OutOfOffice({ date: date, fromTime: fromTime, toTime: toTime, reason, emailSent: today == date ? true : false });

    request.save(err => {
        if (err) throw err;

        sgMail.setApiKey(secrets.EMAIL_KEY);
        const msg = {
            to: secrets.TO_EMAIL,
            from: secrets.FROM_EMAIL,
            subject: 'Out of Office Request',
            html:
                `<strong>***This is an automated message***</strong>
                <p>Max has requested to be excused on ${date} from ${fromTime} to ${toTime}</p>
                <div style="border: 2px solid #ccc; padding: 20px; width: 40%;">
                <h4 style="margin: 0px;">REASON</h4>
                <p style="">${reason}</p>
                </div>
                <p>If you have any questions or concerns, please reply to this email.</p>
                <p>Regards,</p>
                <p>Max's "Out-of-Office-Bot"</p>`
        };
        sgMail.send(msg);
        res.status(200);
    })



})





const server = app.listen(8900, () => {
    const port = server.address().port;
    console.log(`Server listening on port: ${port}`);
});