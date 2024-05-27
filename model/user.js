let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

let UserSchema = Schema({
    nom: String,
    prenom: String,
    dateDeNaissance: Date,
    mail: String, 
    motDePasse: String,
    image: String,
    type: Number,
    isActivate: Boolean,
    isAdmin: Boolean
});

UserSchema.plugin(mongoosePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
// assignment est le nom de la collection dans la base de données
// Mongoose tolère certaines erreurs dans le nom (ex: Assignent au lieu de assignments)
module.exports = mongoose.model('users', UserSchema);
