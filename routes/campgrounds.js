const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');

const Campground = require('../models/campground');
const { campgroundSchema } = require('../joiSchemas');

const express = require('express');
const router = express.Router(); // Le routeur me permet de regrouper plusieurs routes.

const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 420)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req,res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}));
//POST request dans le formulaire HTML.
// Je dois la placer avant "campgrounds/:id" sinon, tout ce qui sera derrière "campgrounds/" sera considéré comme un ID
// "new" y compris, ce qui donnera une erreur.
// L'ordre de déclaration compte.

router.post('/', validateCampground, catchAsync(async (req,res, next) => { // Route qui me permet de créer les camps via formulaire
    // if(!req.body.campground) throw new ExpressError('Ouille!', 420);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`) // Je redirectionne vers la page du camp.
}));

// Je crée une route, j'effectue une MongoQuery (donc async/await) et je render ça dans un fichier ejs.
router.get('/new', catchAsync((req, res, next) => {
    res.render('campgrounds/new')
})); 

router.put('/:_id', validateCampground, catchAsync(async (req, res, next) => { // J'update les données via un formulaire
    const { _id } = req.params._id
    const campground = await Campground.findOneAndUpdate(_id, {...req.body.campground}) // J'identifie le camp par son id.
    res.redirect(`/campgrounds/${campground._id}`) 
}));

router.get('/:_id', catchAsync(async (req,res, next) => {
    const campgrounds = await Campground.findById(req.params._id).populate('reviews'); // j'identifie le camp via son ID et l'affiche
    res.render('campgrounds/show', {campgrounds})
}));
router.delete('/:_id', catchAsync(async (req,res, next) => { // Route qui permet de supprimer de la donnée
    const { _id } = req.params
    await Campground.findByIdAndDelete(_id)
    res.redirect('/campgrounds');
}));

router.get('/:_id/edit', catchAsync(async (req,res, next) => {
    const campgrounds = await Campground.findById(req.params._id);
    res.render('campgrounds/edit', {campgrounds})
}));


module.exports = router;