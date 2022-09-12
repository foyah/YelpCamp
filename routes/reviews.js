const express = require('express');
const router = express.Router({mergeParams : true});

const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../joiSchemas.js');

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 420)
    } else {
        next();
    }
};

router.post('/', validateReview, catchAsync(async (req,res) => {
    const campgrounds = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // Je crée une nouvelle review sur base des attributs name du formulaire dans SHOW.EJS review[body] et review[rating]
    campgrounds.reviews.push(review); // Je push la review en question dans la liste de review liée à chaque camp.
    await review.save();  // J'enregistre la review dans la base de donnée.
    await campgrounds.save(); // J'enregistre l'ajout de la review au campement.
    res.redirect(`/campgrounds/${campgrounds.id}`)
    }));

router.delete('/:reviewId', catchAsync(async (req,res) => { // La route ne fonctionnait pas car j'avais oublié le : devant reviewId
    const {id, reviewId} = req.params;                                           // Les commentaires ne se supprimaient pas.
    await Campground.findByIdAndUpdate(id, {$pull : { reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    }));

module.exports = router;

