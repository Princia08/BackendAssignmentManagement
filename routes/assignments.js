let Assignment = require("../model/assignment");
let Matiere = require("../model/matiere");
const jwtService = require("../services/jwtService");
let mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// Récupérer tous les assignments (GET)
/*
function getAssignments(req, res){
    Assignment.find((err, assignments) => {
        if(err){
            res.send(err)
        }
        res.send(assignments);
    });
}
*/

function getAssignments(req, res) {
  let aggregateQuery = Assignment.aggregate();

  Assignment.aggregatePaginate(
    aggregateQuery,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    },
    (err, data) => {
      if (err) {
        res.send(err);
      }

      res.send(data);
    }
  );
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res) {
  let assignmentId = req.params._id;
  Assignment.findById(assignmentId, (err, assignment) => {
    if (err) {
      res.send(err);
    }
    res.json(assignment);
  });

  /*
    Assignment.findOne({id: assignmentId}, (err, assignment) =>{
        if(err){res.send(err)}
        res.json(assignment);
    })
    */
}

// Ajout d'un assignment (POST)
function postAssignment(req, res) {
  console.log(req.body.nom);
  let assignment = new Assignment();
  assignment.nom = req.body.nom;
  assignment.dateDeRendu = req.body.dateDeRendu;
  assignment.rendu = req.body.rendu;
  assignment.idUser = req.body.idUser;
  assignment.idMatiere = req.body.idMatiere;
  assignment.remarque = req.body.remarque;
  assignment.file = req.body.file;

  console.log("POST assignment reçu :");
  console.log(assignment);

  assignment.save((err, savedAssignment) => {
    if (err) {
      console.error("Error saving assignment:", err);
      res.status(500).send("Error saving assignment");
    } else {
      console.log(`Assignment "${savedAssignment.nom}" saved!`);
      res.status(201).json({ message: `${savedAssignment.nom} saved!` });
    }
  });
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
  console.log("UPDATE recu assignment : ");
  console.log(req.body);
  Assignment.findByIdAndUpdate(
    req.body._id,
    req.body,
    { new: true },
    (err, assignment) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.json({ message: "updated" });
      }

      // console.log('updated ', assignment)
    }
  );
}

function deleteAssignment(req, res) {
  Assignment.findByIdAndRemove(req.params._id, (err, assignment) => {
    if (err) {
      res.send(err);
    }
    res.json({ message: `${assignment.nom} deleted` });
  });
}

async function getAssignmentByMatiereCoriger(req, res) {
  let matiereId = "";
  let token = req.query.token;
  //let date = req.query.token;
  let data = jwtService.verify(token);
  console.log(data);
  // if (data) {
  // let matiereUser = await Matiere.find({ "prof.id": data.id });
  let matiereUser = Matiere.find({
    "prof._id": ObjectId(data.id),
  }).exec((err, results) => {
    if (err) {
      console.error("Error fetching matieres: ", err);
    } else {
      console.log("Matieres found: ", results);
    }
  });
  console.log(matiereUser);
  let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  let limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided
  let skip = (page - 1) * limit;
  //matiereId = "664a51a7f4d06022608a558a";
  matiereId = "66537b96fb30874594c62dc2";
  console.log(matiereId);
  //Assignment.find({ idMatiere: ObjectId(matiereId) })
  Assignment.find({
    idMatiere: matiereId,
    rendu: true,
  })
    // Assignment.find({ nom: "Devoir Angular test " })
    .skip(skip)
    .limit(limit)
    .exec((err, assignments) => {
      // Get the total count of assignments for the given matiereId
      Assignment.countDocuments(
        { idMatiere: ObjectId(matiereId), rendu: true },
        (err, count) => {
          if (err) {
            return res.status(500).send(err);
          }

          res.json({
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            assignments: assignments,
          });
        }
      );
    });
}

async function getAssignmentByMatiereNonCoriger(req, res) {
  let matiereId = "";
  let token = req.query.token;
  //let date = req.query.token;
  let data = jwtService.verify(token);
  console.log(data);
  // if (data) {
  // let matiereUser = await Matiere.find({ "prof.id": data.id });
  let matiereUser = Matiere.find({
    "prof._id": ObjectId(data.id),
  }).exec((err, results) => {
    if (err) {
      console.error("Error fetching matieres: ", err);
    } else {
      console.log("Matieres found: ", results);
    }
  });
  console.log(matiereUser);
  let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  let limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided
  let skip = (page - 1) * limit;
  //matiereId = "664a51a7f4d06022608a558a";
  matiereId = "66537b96fb30874594c62dc2";
  console.log(matiereId);
  //Assignment.find({ idMatiere: ObjectId(matiereId) })
  Assignment.find({
    idMatiere: matiereId,
    rendu: false,
  })
    // Assignment.find({ nom: "Devoir Angular test " })
    .skip(skip)
    .limit(limit)
    .exec((err, assignments) => {
      // Get the total count of assignments for the given matiereId
      Assignment.countDocuments(
        { idMatiere: matiereId, rendu: false },
        (err, count) => {
          if (err) {
            return res.status(500).send(err);
          }

          res.json({
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            assignments: assignments,
          });
        }
      );
    });
}

function corrigerAssignment(req, res) {
  console.log("UPDATE recu assignment : ");
  console.log(req.body._id);
  Assignment.findByIdAndUpdate(
    req.body._id,
    req.body,
    { rendu: true },
    (err, assignment) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.json({ rendu: true });
      }

      // console.log('updated ', assignment)
    }
  );
}

module.exports = {
  getAssignments,
  postAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentByMatiereCoriger,
  corrigerAssignment,
  getAssignmentByMatiereNonCoriger,
};
