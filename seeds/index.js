// Ce script me permet de seed effectivement ma database à chaque fois que je le lance dans le shell avec node

const Campground = require('../models/campground');
const cities = require('./cities'); // J'importe les villes
const {places, descriptors} = require('./seedHelpers') // Destructuring qui me permet de retirer les variables correspondantes
const mongoose = require('mongoose');                   //et les assigner dans ce fichier.
mongoose.connect('mongodb://localhost:27017/yelpCamp', {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Mongo database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]; // Je définis une fonction anonyme qui me permet de générer
                                                                         // Un nombre aléatoire sur base de la longueur du tableau
                                                                         // Ce nombre ne peut donc excéder le nombre d'éléments dudit tableau
const seedDB = async () => {  // Toujours de l'async/await lorsque je travaille une base de données, ça prend du temps (réelle raison ?).                                          
    await Campground.deleteMany({}); // Je supprime toutes la base de données, avant de ré-injecter de la data.
    for(let i = 0; i< 50; i++){ // Je loop 50 fois
        const random1000 = Math.floor(Math.random() * 1000); // Je crée un nombre aléatoire entre 1 et 1000
        const price = Math.floor(Math.random() * 30) +10
        const camp = new Campground({ // Je crée une nouvelle instance (doc) du modèle Campground
            location:`${cities[random1000].city}, ${cities[random1000].state}`, // J'itére à travers cities et récupére une ville et un état.
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/10489597/480x480',
            description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam vitae laboriosam molestias!',
            price
        })
        await camp.save();
    }
}; 

seedDB()
.then(() => {
    mongoose.connection.close() 
});