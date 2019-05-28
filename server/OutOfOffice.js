const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const outOfOfficeSchema = new Schema({
    date: String,
    fromTime: String,
    toTime: String,
    reason: String,
    emailSent: {
        type: Boolean,
        default: false
    }
});


const OutOfOffice = mongoose.model('OutOfOfficeRequest', outOfOfficeSchema);

module.exports = OutOfOffice;