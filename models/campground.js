const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', campgroundSchema);

// Je crée le schéma qui servira à l'enregistrement des différents camps dans la base de données.
// Un titre, un prix, une description et la localisation du camp.