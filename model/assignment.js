let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

let AssignmentSchema = Schema({
    _id: String,
    dateDeRendu: Date,
    nom: String,
    rendu: Boolean,
    idMatiere: String,
    idUser: String,
    file: String,
    remarque: String,
});

AssignmentSchema.plugin(mongoosePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
// assignment est le nom de la collection dans la base de données
// Mongoose tolère certaines erreurs dans le nom (ex: Assignent au lieu de assignments)
module.exports = mongoose.model('assignments', AssignmentSchema);
