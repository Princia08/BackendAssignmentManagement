const User = require('../model/user');
const jwtService = require('../services/jwtService');
let ObjectID = require('mongodb').ObjectID;

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
    // User.findById(userId, (err, user) =>{
    //     if(err){res.send(err)}
    //     res.json(user);
    // })
    User.findOne({ _id: userId }, (err, user) => {
        if(err){res.send(err)}
        res.json(user); 
    })
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
    User.findOne({mail: mail, motDePasse: password}, (err, user) =>{
        if(err){
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

        data = {id: user._id, nom: user.prenom, type: user.type}
        res.json(jwtService.sign(data))
    })
}

function decodeToken(req, res) {
    let token = req.params.token;
    res.json(jwtService.verify(token))
}

module.exports = { getUsers, getUser, login, decodeToken, getMyInformation };
