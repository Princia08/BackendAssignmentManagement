let Assignment = require("../model/assignment");

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

// suppression d'un assignment (DELETE)
// l'id est bien le _id de mongoDB
function deleteAssignment(req, res) {
  Assignment.findByIdAndRemove(req.params._id, (err, assignment) => {
    if (err) {
      res.send(err);
    }
    res.json({ message: `${assignment.nom} deleted` });
  });
}

module.exports = {
  getAssignments,
  postAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
};
