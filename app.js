// DEPENDENCIES

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');

const ExpressError = require('./helpers/ExpressError');
const morgan = require('morgan');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const campgroundsRouter = require('./routes/campgrounds');
const reviewsRouter = require('./routes/reviews');

// SETUP MONGODB

mongoose.connect('mongodb://localhost:27017/yelpCamp', {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Mongo database connected");
});

// EJS + VIEWS + PUBLIC

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ROUTER

app.use(express.urlencoded({extended: true})); // Permet de parse les req.body afin qu'elles soient lisibles.
app.use(morgan('dev')); // Permet de printer toutes les requêtes dans la console.
app.use(methodOverride('_method'));

app.use('/campgrounds', campgroundsRouter);
app.use('/campgrounds/:id/reviews', reviewsRouter);

// SETUP EXPRESS REQUEST

app.get('/', (req,res, next) => {
    res.render('home')
});

// ERRORS ROUTE

app.use((err,req,res,next) => {
    const { message = 'Something went wrong', statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no something went wrong!';
    res.status(statusCode).render('error', {err});
});

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found My Boy!', 420))
});

// PORT SETUP

app.listen(3000, () => {
    console.log('Connected on port 3000')
});