const User = require('../model/user');
const jwtService = require('../services/jwtService');
let ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nombre de tours de hachage

// Récupérer tous les users (GET)
function getUsers(req, res){
    User.find((err, user) => {
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
    // User.findOne({ _id: userId }, (err, user) => {
    //     if(err){res.send(err)}
    //     res.json(user); 
    // })
}

function getMyInformation(req, res) {
    let data = jwtService.verify(req.params.token)
    console.log(data.user.id)
    User.findById(data.user.id, (err, user) =>{
        if(err){res.send(err)}
        res.json(user);
    })
}

function login(req, res){
    let mail = req.body.mail;
    let password = req.body.password;

    User.findOne({ mail: mail }, (err, user) =>{
        if(err) {
            res.send(err)
            return 
        }
        if(!mail || !password){
            res.status(401).send('L\'email et le mot de passe sont des champs obligatoires')
            return
        }
        if(user === null){
            res.status(401).send('Email ou mot de passe incorrect')
            return
        }
        // comparer le mot de passe hashé et le mot de passe entré pas l'user
        bcrypt.compare(password, user.motDePasse, (err, result) => {
            if(err) return err;
            if(!result) {
                res.status(401).send('Email ou mot de passe incorrect')
                return
            }
        })

        if(!user.isActivate){
            res.status(401).send('Veuillez contacter le responsable, votre compte n\'est pas encore activé')
            return
        }

        data = {id: user._id, nom: user.prenom, type: user.type}
        res.json(jwtService.sign(data))
    })
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

    console.log("POST user reçu :");
    console.log(user)

    user.save( (err) => {
        if(err){
            res.status(500).send('Error while saving user: ' + err);
        }
        res.json({ message: `${user.nom} saved!`})
    })
}

function decodeToken(req, res) {
    let token = req.params.token;
    res.json(jwtService.verify(token))
}

module.exports = { getUsers, getUser, login, decodeToken, getMyInformation, addUser };
