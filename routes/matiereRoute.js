let matiere = require("../model/matiere");

const getAllMatieres = (req, res) => {
  matiere.find((err, mat) => {
    if (err) {
      res.send(err);
    }
    res.send(mat);
  });
};

module.exports = { getAllMatieres };
