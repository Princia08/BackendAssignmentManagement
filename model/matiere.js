const { ObjectID } = require('mongodb');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

let MatiereSchema = Schema({
  nom: String,
  prof: {
    _id: ObjectID, 
    nom: String,
    prenom: String,
    image: String,
  },
  image: String,
});

MatiereSchema.plugin(mongoosePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
// assignment est le nom de la collection dans la base de données
// Mongoose tolère certaines erreurs dans le nom (ex: Assignent au lieu de assignments)
module.exports = mongoose.model("matiere", MatiereSchema);
