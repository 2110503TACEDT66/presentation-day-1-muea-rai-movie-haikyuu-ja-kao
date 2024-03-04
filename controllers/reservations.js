const Reservation = require('../models/Reservation');
const CoWorkingSpace = require('../models/CoWorkingSpace');

//@desc     : Get all reservations
//@route    : GET /api/v1/reservations
//@acces    : Public
exports.getReservations = async (req, res, next) => {
    let query;
    //general users can see only their reservation
    if (req.user.role != 'admin') {
        query = Reservation.find({user: req.user.id}).populate({
            path: 'coWorkingSpace',
            select: 'name address tel open_close_time'
        });
    } else {
        //admin can see all
        if (req.params.coWorkingSpaceId) {
            console.log(req.params.coWorkingSpaceId);
            query = Reservation.find({reservation: req.params.reservationId}).populate({
                path: 'coWorkingSpace',
                select: 'name address tel open_close_time'
            });
        } else {
            query = Reservation.find().populate({
                path: 'coWorkingSpace',
                select: 'name address tel open_close_time'
            });
        }
    }

    try {
        const reservations = await query;
        res.status(200).json({success: true, count: reservations.length, data: reservations});
    } catch (err) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot find reservation"});
    }
};

//@desc     : Get single reservation
//@route    : GET /api/v1/reservations/:id
//@acces    : Public
exports.getReservation = async (req, res, next) => {
    // try {
    //     const reservation = await Reservation.findById(req.params.id).populate({
    //         path: 'reservations',
    //         select: 'name address tel open_close_time'
    //     });
    //     if (!reservation) {
    //         return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
    //     }

    //     res.status(200).json({success: true, data: reservation});
    // } catch (err) {
    //     console.log(error.stack);
    //     return res.status(500).json({success: false, message: "Cannot find reservation"});
    // }

    try { 
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'reservations',
            select: 'name address tel open_close_time'
        });
        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        //make sure user is the reservation owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} does not have a reservation with the id ${req.params.id}`});
        }

        res.status(200).json({success: true, data: reservation});
    } catch (err) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot find reservation"});
    }
};

//@desc     : Add reservation
//@route    : POST /api/v1/coWorkingSpaces/:coWorkingSpaceId/reservations
//@acces    : Private
exports.addReservation = async (req, res, next) => {
    try { 
        req.body.coWorkingSpace = req.params.coWorkingSpaceId;
        const coWorkingSpace = await CoWorkingSpace.findById(req.params.coWorkingSpaceId);
        console.log(coWorkingSpace);
        if (!coWorkingSpace) {
            return res.status(400).json({success: false, message: `No co-working space with the id of ${req.params.coWorkingSpaceId}`});
        }
        console.log(req.body);

        //add user ID to req.body
        req.body.user = req.user.id;
        //check for existed appointment
        const existedReservations = await Reservation.find({user: req.user.id});
        //if the user is not an admin, they can only create 3 appointments
        if (existedReservations.length >= 3 && req.user.role != 'admin') {
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 reservations`});
        }

        const reservation = await Reservation.create(req.body);
        res.status(200).json({success: true, data: reservation});
    } catch (err) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot create reservation"});
    }
};

//@desc     : Update reservation
//@route    : PUT /api/v1/reservations/:id
//@acces    : Private
exports.updateReservation = async (req, res, next) => {
    try { 
        let reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        //make sure user is the reservation owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`});
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        res.status(200).json({success: true, data: reservation});
    } catch (err) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot update reservation"});
    }
};

//@desc     : Delete reservation
//@route    : DELETE /api/v1/reservations/:id
//@acces    : Private
exports.deleteReservation = async (req, res, next) => {
    try { 
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        //make sure user is the appointment owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this reservation`});
        }

        await reservation.deleteOne();
        res.status(200).json({success: true, data: {}});
    } catch (err) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot delete reservation"});
    }
};