class MatiereServices {
  // Get Matiere by user not API, just the service to get the data from MongoDB
  getMatiereByProf(user) {
    return new Promise((resolve, reject) => {
      Matiere.find(
        {
          "prof.id": user.id,
          // "prof.nom": user.nom,
          // "prof.prenom": user.prenom,
        },
        (err, matieres) => {
          if (err) {
            return reject(err);
          }
          resolve(matieres);
        }
      );
    });
  }
}

module.exports = new MatiereServices();
