let Matiere = require("../model/matiere");

const getAllMatieres = (req, res) => {
  Matiere.find((err, mat) => {
    if (err) {
      res.send(err);
    }
    res.send(mat);
  });
};

// Ajout d'une matière (POST)
async function postMatiere(req, res) {
  let matiere = new Matiere();
  matiere.nom = req.body.nom;
  matiere.image = req.body.image;
  matiere.prof._id = req.body.prof._id;
  matiere.prof.nom = req.body.prof.nom;
  matiere.prof.prenom = req.body.prof.prenom;
  matiere.prof.image = req.body.prof.image;
  
  const existingMatiere = await Matiere.findOne({ nom: matiere.nom })
  if(existingMatiere) return res.status(401).send("La matière " + matiere.nom + " existe déjà, veuillez choisir une autre")

  
  matiere.save((err, savedMatiere) => {
    if (err) {
      console.error("Error saving matiere:", err);
      res.status(500).send("Error saving matiere");
    } else {
      console.log(`Matiere "${savedMatiere.nom}" saved!`);
      res.status(201).json({ message: `${savedMatiere.nom} saved!` });
    }
  });
}


module.exports = { getAllMatieres, postMatiere };
