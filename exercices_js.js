const produits = [
    { nom: 'Clavier', prix: 45 },
    { nom: 'Écran', prix: 320 },
    { nom: 'Souris', prix: 25 }
];

// 1.Déstructuration
const { nom, prix } = produits[0];
console.log(nom, prix);

// 2.find
const souris = produits.find(p=> p.nom === 'Souris')
console.log("prix : "+ souris.prix);

// 3. filter
console.log(produits.filter(p => p.prix < 100));

// 4. Fonction fléchée
const avecRemise = prix => prix * 0.9;
console.log(avecRemise(320));

