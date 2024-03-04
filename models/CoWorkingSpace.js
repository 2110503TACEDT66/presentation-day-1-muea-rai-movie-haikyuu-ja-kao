const mongoose = require('mongoose');

const CoWorkingSpaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxLength: [100, 'Name cannot be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add a address'],
    },
    tel: {
        type: String,
    },
    open_close_time: {
        type: String,
        required: [true, 'Please add a open-close time'],
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//cascade delete reservations when a co-working space is deleted
CoWorkingSpaceSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Reservations being removed from co-working space ${this.id}`);
    await this.model('Reservation').deleteMany({coWorkingSpace: this.id});
    next();
});

//reverse populate with virtuals
CoWorkingSpaceSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'coWorkingSpace',
    justOne: false
});

module.exports = mongoose.model('CoWorkingSpace', CoWorkingSpaceSchema);