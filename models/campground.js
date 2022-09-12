const { ref } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews : [{
        type: Schema.Types.ObjectId,
        ref : 'Review'
    }]
});
// Je crée le schéma qui servira à l'enregistrement des différents camps dans la base de données.
// Un titre, un prix, une description, la localisation du camp et les avis.

campgroundSchema.post('findOneAndDelete', async function (doc) { // Middleware Mongoose permettant d'effectuer une action après l'exécution du middleware findOneAndDelete().
    if(doc){
        await Review.deleteMany({ 
            _id:{
                $in: doc.reviews // On supprime toutes les reviews reliées au campement supprimé, grâce à $in:
            }                    
        })
    };
})

module.exports = mongoose.model('Campground', campgroundSchema);
