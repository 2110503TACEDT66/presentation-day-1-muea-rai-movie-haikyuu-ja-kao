const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const coWorkingSpaces = require('./routes/coWorkingSpaces');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');

const app=express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Mount routes
app.use('/api/v1/coWorkingSpaces',coWorkingSpaces);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);

const PORT=process.env.PORT || 5001;
const server = app.listen(
    PORT, 
    console.log('Server running in ',process.env.NODE_ENV,
    "on" + process.env.HOST + ":" + PORT));

const swaggerOptions = {
    swaggerDefinition:{
        openai: '3.0.0',
        info:{
            title: 'Library API',
            version: '1.0.0',
            description: 'Co-working Space API'
        },
        servers: [
            {
                url: process.env.HOST + ':' + PORT + 'api/v1'
            }
        ],
    },
    apis:['./route/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server and exit process
    server.close(()=>process.exit(1));
});