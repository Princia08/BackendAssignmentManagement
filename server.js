require('dotenv').config();
let express = require('express');
const multer = require('multer');

let app = express();
let bodyParser = require("body-parser");
let assignment = require("./routes/assignments");
let user = require("./routes/users");
let matiere = require("./routes/matieres");

let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);

// remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud s
const uri =
  "mongodb+srv://Princia:assignmentPass@cluster0.o9giuko.mongodb.net/assignments?retryWrites=true&w=majority&appName=Cluster0";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose.connect(uri, options).then(
  () => {
    console.log("Connecté à la base MongoDB assignments dans le cloud !");
    console.log("at URI = " + uri);
    console.log(
      "vérifiez with http://localhost:" +
        port +
        "/api/assignments que cela fonctionne"
    );
  },
  (err) => {
    console.log("Erreur de connexion: ", err);
  }
);

// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Pour les formulaires
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Obligatoire si déploiement dans le cloud !
let port = process.env.PORT || 8010;


// stocker image uploadée dans le dossier images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
     cb(null, 'images/');
  },
  filename: function (req, file, cb) {
     cb(null, file.originalname);
  }
 });

const upload = multer({ storage: storage });


// les routes
const prefix = "/api";

// upload image
app.post(prefix + '/upload', upload.single('image'), (req, res) => {
  res.json('File uploaded successfully');
});

// assignments
app
  .route(prefix + "/assignments")
  .post(assignment.postAssignment)
  .put(assignment.updateAssignment)
  .get(assignment.getAssignments);

app
  .route(prefix + "/assignments/:id")
  .get(assignment.getAssignment)
  .delete(assignment.deleteAssignment);

// users
userUri = prefix + "/users";
app.route(userUri)
  .post(user.addUser)
  .put(user.updateUser);

app.route(userUri + "/:inactivated").get(user.getInactivatedUsers);

app.route(userUri + "/:id").get(user.getUser);
app.route(userUri + "/login").post(user.login);
app.route(userUri + "/me/:token").get(user.getMyInformation);

//matiere
matiereUri = prefix + "/matieres";
app.route(matiereUri)
.get(matiere.getAllMatieres)
.post(matiere.postMatiere);

app.timeout = 300000;
// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log("Serveur démarré sur http://localhost:" + port);

module.exports = app;
