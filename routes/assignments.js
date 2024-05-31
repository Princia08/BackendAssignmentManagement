const { Decimal128 } = require("mongodb");
let Assignment = require("../model/assignment");

let Matiere = require("../model/matiere");
const jwtService = require("../services/jwtService");
let mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

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

function getMyAssignment(req, res) {
  const data = jwtService.verify(req.params.token);
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 

  const skip = (page - 1) * limit;

  Assignment.find({ idUser: data.user.id })
    .populate("idMatiere")
    .skip(skip)
    .limit(limit)
    .exec(async (err, assignments) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const totalDocs = await Assignment.countDocuments({
          idUser: data.user.id,
        });
        const totalPages = Math.ceil(totalDocs / limit);

        res.status(200).json({
          assignments: assignments,
          totalDocs: totalDocs,
          limit: limit,
          page: page,
          totalPages: totalPages,
          pagingCounter: skip + 1,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
        });
      }
    });
}

// Récupérer un assignment par son id (GET)
function getAssignmentDetails(req, res) {
  let assignmentId = req.params.id;
  Assignment.findById(assignmentId)
    .populate("idMatiere")
    .exec((err, assignment) => {
      if (err) {
        res.send(err);
      }
      res.json(assignment);
    });
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res) {
  let assignmentId = req.params.id;
  Assignment.findById(assignmentId, (err, assignment) => {
    if (err) {
      res.send(err);
    }
    res.json(assignment);
  });
}

// Ajout d'un assignment (POST)
function postAssignment(req, res) {
  let assignment = new Assignment();
  assignment.nom = req.body.nom;
  assignment.dateDeRendu = req.body.dateDeRendu;
  assignment.rendu = req.body.rendu;
  assignment.idUser = req.body.idUser;
  assignment.idMatiere = req.body.idMatiere;
  assignment.remarque = req.body.remarque;
  assignment.file = req.body.file;
  assignment.note = 0;

  assignment.save((err, savedAssignment) => {
    if (err) {
      console.error("Error saving assignment:", err);
      res.status(500).send("Error saving assignment");
    } else {
      res.status(201).json({ message: `${savedAssignment.nom} saved!` });
    }
  });
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
  console.log("UPDATE recu assignment : ");
  Assignment.findByIdAndUpdate(
    req.body.id,
    req.body,
    { new: true },
    (err, assignment) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.json({ message: "updated" });
      }
    }
  );
}

function deleteAssignment(req, res) {
  Assignment.findByIdAndRemove(req.params.id, (err, assignment) => {
    if (err) {
      res.send(err);
    }
    res.json({ message: `${assignment.nom} deleted` });
  });
}

async function getAssignmentByMatiereCoriger(req, res) {
  try {
    const token = req.query.token;
    const data = jwtService.verify(token);
    const matiereUser = await Matiere.findOne({
      "prof._id": ObjectId(data.user.id),
    }).exec();
    if (!matiereUser) {
      return res.status(404).json({ message: "Matiere not found" });
    }

    const matiereId = matiereUser._id; 
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const assignments = await Assignment.find({
      idMatiere: ObjectId(matiereId),
      rendu: true,
    })
      .populate("idMatiere")
      .skip(skip)
      .limit(limit)
      .exec();
    const totalDocs = await Assignment.countDocuments({
      idMatiere: ObjectId(matiereId),
      rendu: true,
    });

    const totalPages = Math.ceil(totalDocs / limit);

    res.json({
      assignments: assignments,
      totalDocs: totalDocs,
      limit: limit,
      page: page,
      totalPages: totalPages,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    });
  } catch (err) {
    console.error("Error fetching assignments: ", err);
    res.status(500).send(err);
  }
}

async function getAssignmentByMatiereNonCoriger(req, res) {
  try {
    const token = req.query.token;
    const data = jwtService.verify(token);

    // Fetch the matiere for the given user
    const matiereUser = await Matiere.findOne({
      "prof._id": ObjectId(data.user.id),
    }).exec();
    if (!matiereUser) {
      return res.status(404).json({ message: "Matiere not found" });
    }

    const matiereId = matiereUser._id;
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    // Fetch assignments for the given matiereId where rendu is false
    const assignments = await Assignment.find({
      idMatiere: matiereId,
      rendu: false,
    })
      .populate("idMatiere")
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of non-corrected assignments for the given matiereId
    const totalDocs = await Assignment.countDocuments({
      idMatiere: ObjectId(matiereId),
      rendu: false,
    });

    const totalPages = Math.ceil(totalDocs / limit);

    res.json({
      assignments: assignments,
      totalDocs: totalDocs,
      limit: limit,
      page: page,
      totalPages: totalPages,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    });
  } catch (err) {
    console.error("Error fetching assignments: ", err);
    res.status(500).send(err);
  }
}

function corrigerAssignment(req, res) {
  console.log("UPDATE recu assignment : ");
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
    }
  );
}

function deleteManyAssignment(req, res) {
  Assignment.updateMany(
    { note: null },
    { $set: { note: 12 } },
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res
          .status(200)
          .json({ message: `${result.nModified} document(s) updated` });
      }
    }
  );
}

module.exports = {
  getAssignments,
  postAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getMyAssignment,
  getAssignmentDetails,
  getAssignmentByMatiereCoriger,
  corrigerAssignment,
  getAssignmentByMatiereNonCoriger,
  deleteManyAssignment,
};
