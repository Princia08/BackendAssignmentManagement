const User = require('../model/user');
const jwtService = require('../services/jwtService');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nombre de tours de hachage
const validator = require('validator');

// Récupérer tous les users (GET)
function getInactivatedUsers(req, res){
    User.find({ isActivate: false }, (err, user) => {
        if(err){
            res.send(err)
        }
        res.send(user);
    });
}

// Récupérer un user par son id (GET)
function getUser(req, res){
    let userId = req.params.id;
    User.findById(userId, (err, user) =>{
        if(err){res.send(err)}
        res.json(user);
    })
}

async function getMyInformation(req, res) {
    let data = await jwtService.verify(req.params.token)
    console.log(data)
    User.findById(data.user.id, (err, user) =>{
        if(err){res.send(err)}
        res.json(user);
    })
}

async function login(req, res){
    let mail = req.body.mail;
    let password = req.body.password;

    if(!mail || !password) return res.status(401).send('L\'email et le mot de passe sont des champs obligatoires')

    const user = await User.findOne({ mail: mail })
            
    if(user === null) return res.status(401).send('L\'utilisateur que vous avez entré n\'existe pas')

    // comparer le mot de passe hashé et le mot de passe entré pas l'user
    const verifiedPassword = await bcrypt.compare(password, user.motDePasse)
    if(!verifiedPassword) return res.status(401).send('Email ou mot de passe incorrect')

    if(!user.isActivate) return res.status(401).send('Veuillez contacter le responsable, votre compte n\'est pas encore activé')

    const data = { id: user._id, nom: user.prenom, type: user.type }
    res.json(jwtService.sign(data))
}

// Ajout d'un user (POST)
async function addUser(req, res) {
    let user = new User();
    user.nom = req.body.nom;
    user.prenom = req.body.prenom;
    user.dateDeNaissance = req.body.dateDeNaissance;
    user.mail = req.body.mail;
    user.motDePasse = await bcrypt.hash(req.body.password, saltRounds);
    user.image = req.body.image;
    user.type = req.body.type;
    user.isActivate = req.body.isActivate;
    user.isAdmin = req.body.isAdmin;

    if(!validator.isEmail(user.mail)) return res.status(401).send('Veuillez entrer un mail valide')

    const existingUser = await User.findOne({ mail: user.mail })
    if(existingUser) return res.status(401).send('Cet email est déjà utilisé, veuillez choisir un autre')

    user.save( (err) => {
        if(err){
            res.status(500).send('Error while saving user: ' + err);
            return;
        }
        res.json({ message: `${user.nom} saved!`})
    })
}

// Activer un user (PUT)
function updateUser(req, res) {
    User.findByIdAndUpdate(
      req.body._id,
      req.body,
      { new: true },
      (err, user) => {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.json({ message: `${user.nom} updated!` });
        }
      }
    );
  }

function decodeToken(req, res) {
    let token = req.params.token;
    res.json(jwtService.verify(token))
}

module.exports = { updateUser, getInactivatedUsers, getUser, login, decodeToken, getMyInformation, addUser };
