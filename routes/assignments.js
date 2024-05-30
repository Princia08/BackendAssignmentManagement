const { Decimal128 } = require("mongodb");
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

function getMyAssignment(req, res) {
  let data = jwtService.verify(req.params.token);
  Assignment.find({ idUser: data.user.id })
    .populate("idMatiere")
    .exec((err, assignment) => {
      if (err) {
        res.send(err);
      }
      res.json(assignment);
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

// async function getAssignmentByMatiereCoriger(req, res) {
//   let matiereId = "";
//   let token = req.query.token;
//   //let date = req.query.token;
//   let data = jwtService.verify(token);
//   let matiereUser = Matiere.find({
//     "prof._id": ObjectId(data.id),
//   }).exec((err, results) => {
//     if (err) {
//       console.error("Error fetching matieres: ", err);
//     } else {
//       console.log("Matieres found: ", results);
//     }
//   });
//   let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//   let limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided
//   let skip = (page - 1) * limit;
//   matiereId = "66537b96fb30874594c62dc2";
//   Assignment.find({
//     idMatiere: matiereId,
//     rendu: true,
//   })
//     .populate("idMatiere")
//     .skip(skip)
//     .limit(limit)
//     .exec((err, assignments) => {
//       // Get the total count of assignments for the given matiereId
//       Assignment.countDocuments(
//         { idMatiere: ObjectId(matiereId), rendu: true },
//         (err, count) => {
//           if (err) {
//             return res.status(500).send(err);
//           }

//           res.json({
//             totalCount: count,
//             totalPages: Math.ceil(count / limit),
//             currentPage: page,
//             assignments: assignments,
//           });
//         }
//       );
//     });
// }
// async function getAssignmentByMatiereCoriger(req, res) {
//   try {
//     // Authenticate the user and retrieve user data
//     const token = req.query.token;
//     const data = jwtService.verify(token);

//     // Find matiereId for the authenticated user
//     const matiereUser = await Matiere.findOne({
//       "prof._id": ObjectId(data.id),
//     });

//     // if (!matiereUser) {
//     //   return res.status(404).send("Matiere not found for the user.");
//     // }

//     // const matiereId = matiereUser.id;
//     const matiereId = "66537b96fb30874594c62dc2";
//     // Set pagination parameters
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     // Aggregate query with pagination
//     const aggregateQuery = Assignment.aggregate([
//       { $match: { idMatiere: matiereId, rendu: true } },
//       {
//         $lookup: {
//           from: "matieres",
//           localField: "idMatiere",
//           foreignField: "_id",
//           as: "matieres",
//         },
//       },
//       {
//         $unwind: { path: "$matieres", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "users", // Replace with the actual collection name for professors
//           localField: "matieres.prof", // Assuming matieres.prof contains the professor's _id
//           foreignField: "_id",
//           as: "matieres.prof",
//         },
//       },
//       {
//         $unwind: { path: "$matieres.prof", preserveNullAndEmptyArrays: true },
//       },
//     ]);

//     console.log(aggregateQuery);
//     // Paginate the results
//     Assignment.aggregatePaginate(
//       aggregateQuery,
//       { page, limit },
//       (err, result) => {
//         if (err) {
//           return res.status(500).send(err);
//         }

//         // Custom response structure
//         res.json({
//           totalCount: result.totalDocs, // Renamed from totalDocs
//           totalPages: result.totalPages,
//           currentPage: result.page,
//           assignments: result.docs,
//         });
//       }
//     );
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// }
async function getAssignmentByMatiereCoriger(req, res) {
  try {
    const token = req.query.token;
    const data = jwtService.verify(token);

    const matiereUser = await Matiere.findOne({
      "prof._id": data.user.id,
    }).exec();
    // if (!matiereUser) {
    //   return res.status(404).json({ message: "Matiere not found" });
    // }

    const matiereId = "66537b96fb30874594c62dc2"; // You may need to derive this dynamically
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided
    const skip = (page - 1) * limit;

    const assignments = await Assignment.find({
      idMatiere: matiereId,
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

// async function getAssignmentByMatiereNonCoriger(req, res) {
//   try {
//     const token = req.query.token;
//     const data = jwtService.verify(token);

//     // Fetch the matiere for the given user
//     const matiereUser = await Matiere.findOne({
//       "prof._id": ObjectId(data.user.id),
//     }).exec();
//     if (!matiereUser) {
//       return res.status(404).json({ message: "Matiere not found" });
//     }

//     const matiereId = "66537b96fb30874594c62dc2"; // This should ideally be derived dynamically
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided
//     const skip = (page - 1) * limit;

//     // Fetch assignments for the given matiereId where rendu is false
//     const assignments = await Assignment.find({
//       idMatiere: matiereId,
//       rendu: false,
//     })
//       .skip(skip)
//       .limit(limit)
//       .exec();

//     // Get the total count of non-corrected assignments for the given matiereId
//     const totalDocs = await Assignment.countDocuments({
//       idMatiere: ObjectId(matiereId),
//       rendu: false,
//     });

//     const totalPages = Math.ceil(totalDocs / limit);

//     res.json({
//       docs: assignments,
//       totalDocs: totalDocs,
//       limit: limit,
//       page: page,
//       totalPages: totalPages,
//       pagingCounter: skip + 1,
//       hasPrevPage: page > 1,
//       hasNextPage: page < totalPages,
//       prevPage: page > 1 ? page - 1 : null,
//       nextPage: page < totalPages ? page + 1 : null,
//     });
//   } catch (err) {
//     console.error("Error fetching assignments: ", err);
//     res.status(500).send(err);
//   }
// }
async function getAssignmentByMatiereNonCoriger(req, res) {
  try {
    const token = req.query.token;
    const data = jwtService.verify(token);

    // Fetch the matiere for the given user
    const matiereUser = await Matiere.findOne({
      "prof._id": ObjectId(data.user.id),
    }).exec();
    // if (!matiereUser) {
    //   return res.status(404).json({ message: "Matiere not found" });
    // }

    const matiereId = "66537b96fb30874594c62dc2"; // This should ideally be derived dynamically
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided
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
  getMyAssignment,
  getAssignmentDetails,
  getAssignmentByMatiereCoriger,
  corrigerAssignment,
  getAssignmentByMatiereNonCoriger,
};
