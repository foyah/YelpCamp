const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const catchAsync = require('./helpers/catchAsync');
const morgan = require('morgan');
const { campgroundSchema, reviewSchema } = require('./joiSchemas');
const ExpressError = require('./helpers/ExpressError');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const mongoose = require('mongoose');
const Review = require('./models/review');



mongoose.connect('mongodb://localhost:27017/yelpCamp', {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Mongo database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev')); // Permet de printer toutes les requêtes dans la console.
app.use(express.urlencoded({extended: true})); // Permet de parse les req.body afin qu'elles soient lisibles.
app.use(methodOverride('_method'));

const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 420)
    } else {
        next();
    }
}

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 420)
    } else {
        next();
    }
}

app.get('/', (req,res, next) => {

    res.render('home')
});
app.get('/campgrounds', catchAsync(async (req,res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}));

// Je crée une route, j'effectue une MongoQuery (donc async/await) et je render ça dans un fichier ejs.
app.get('/campgrounds/new', catchAsync((req, res, next) => {
    res.render('campgrounds/new')
})); //POST request dans le formulaire HTML.
// Je dois la placer avant "campgrounds/:id" sinon, tout ce qui sera derrière "campgrounds/" sera considéré comme un ID
// "new" y compris, ce qui donnera une erreur.
// L'ordre de déclaration compte.

app.post('/campgrounds',validateCampground, catchAsync(async (req,res, next) => { // Route qui me permet de créer les camps via formulaire
    // if(!req.body.campground) throw new ExpressError('Ouille!', 420);
    const campground = new Campground(req.body.campground);
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`) // Je redirectionne vers la page du camp.
}));

app.put('/campgrounds/:_id', validateCampground, catchAsync(async (req, re, next) => { // J'update les données via un formulaire
    const { _id } = req.params._id
    const campground = await Campground.findOneAndUpdate(_id, {...req.body.campground}) // J'identifie le camp par son id.
    res.redirect(`/campgrounds/${campground._id}`) 
}));

app.get('/campgrounds/:_id', catchAsync(async (req,res, next) => {
    const campgrounds = await Campground.findById(req.params._id).populate('reviews'); // j'identifie le camp via son ID et l'affiche
    res.render('campgrounds/show', {campgrounds})
}));

app.get('/campgrounds/:_id/edit', catchAsync(async (req,res, next) => {
    const campgrounds = await Campground.findById(req.params._id);
    res.render('campgrounds/edit', {campgrounds})
}));
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req,res) => { // La route ne fonctionnait pas car j'avais oublié le : devant reviewId
const {id, reviewId} = req.params;                                           // Les commentaires ne se supprimaient pas.
    const campgrounds = await Campground.findByIdAndUpdate(id, {$pull : { reviews : reviewId}});
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:_id', catchAsync(async (req,res, next) => { // Route qui permet de supprimer de la donnée
    const { _id } = req.params
    const campgrounds = await Campground.findByIdAndDelete(_id)
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:_id/reviews', validateReview, catchAsync(async (req,res) => {
    const campgrounds = await Campground.findById(req.params._id);
    const review = new Review(req.body.review); // Je crée une nouvelle review sur base des attributs name du formulaire dans SHOW.EJS review[body] et review[rating]
    campgrounds.reviews.push(review); // Je push la review en question dans la liste de review liée à chaque camp.
    await review.save();  // J'enregistre la review dans la base de donnée.
    await campgrounds.save(); // J'enregistre l'ajout de la review au campement.
    res.redirect(`/campgrounds/${campgrounds._id}`)
}))


app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found My Boy!', 420))
});

app.use((err,req,res,next) => {
    const {message = 'Something went wrong', statusCode = 500} = err
    if(!err.message) err.message = 'Oh no something went wrong!';
    res.status(statusCode).render('error', {err});
});


app.listen(3000, () => {
    console.log('Connected on port 3000')
});