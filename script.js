// --- Caractéristiques du jeu ---
const game = {
    canPlay: true,              // Autorisation de jouer
    cards: [],                  // Liste des cartes sur la table de jeu
    distinctCards: 10,          // Nombre de cartes distinctes
    elDeck: null,               // Elément DOM de la table des cartes
    elScore: null,              // Elément DOM de l'afficheur principal de score
    elHighscore: null,          // Elément DOM de l'afficheur de record
    elBtnClear: null,           // Elément DOM du bouton de remise à zéro du record
    elWin: null,                // Elément DOM du panneau victoire
    elWinScore: null,           // Elément DOM de l'afficheur de score du panneau victoire
    elBtnAgain: null,           // Elément DOM du bouton "Rejouer"
    elFirstCard: null,          // Mémorisation de première carte retournée pour un tour
    flippedPairs: 0,            // Nombre de paires valides déjà retournées
    highscore: 0,               // Record actuel
    score: 0,                   // Score actuel
    scoreStorage: 'highscore',  // Nom du stockage du record
    showTime: 1000,             // Temps de visibilité des paires incorrectes (en millisecondes)
    timer: null                 // Minuteur de visibilité des paires incorrectes
};


// --- Gestion des cartes ---
/**
 * Gère chaque clic sur une carte
 */
const handlerCardClick = function() {

    // La carte cliquée n'est pas jouable OU on n'est pas autorisé à jouer ? => sortie de la fonction
    if( this.dataset.playable == 0 || ! game.canPlay ) return;

    // Remise à zéro du minuteur de visibilité des paires incorrectes
    clearTimeout( game.timer );

    // Ajout de la class CSS "flipped" à la carte cliquée
    this.classList.add( 'flipped' );

    // Il n'y a pas de première carte retournée ?
    if( game.elFirstCard === null ) {

        // La carte cliquée devient non jouable
        this.dataset.playable = 0;

        // Puis est enregistrée en tant que première carte retournée
        game.elFirstCard = this;

        // Sortie de la fonction
        return;

    }

    // On n'arrive ici lorsque l'on clique sur la deuxième carte à retourner
    // Incrémentation du score de 1, puis mise à jour son afficheur
    game.score ++;
    game.elScore.textContent = game.score;

    // On ferme l'autorisation de jouer en attendant de déterminer si les cartes retournées correspondent
    game.canPlay = false;

    // La carte cliquée correspond à celle dèjà retournée ?
    if( this.dataset.id === game.elFirstCard.dataset.id ) {

        // La carte cliquée devient non jouable
        this.dataset.playable = 0;

        // Réinitialisation de la mémorisation de première carte retournée
        game.elFirstCard = null;
        
        // Rétablissement de l'autorisation de jouer
        game.canPlay = true;
        
        // Incrémentation de 1 du nombre de paires valides déjà retournées
        game.flippedPairs ++;

        // Toutes les paires ont été retournées ? => Déclenchement de la victoire
        if( game.flippedPairs === game.distinctCards ) winGame();

        // Sortie
        return;

    }

    // On n'arrive ici que lorsque la deuxième carte retournée ne correspond pas à la première
    // Déclenchement d'un minuteur qui retourne automatiquement les deux cartes face contre table
    game.timer = setTimeout( _ => {

        // Retrait de la class CSS "flipped" de la carte cliquée
        this.classList.remove( 'flipped' );

        // Gestion de la première carte retournée
        // Retrait de la class CSS "flipped"
        game.elFirstCard.classList.remove( 'flipped' );

        // La première carte retournée redevient jouable
        game.elFirstCard.dataset.playable = 1;

        // Réinitialisation de la mémorisation de première carte retournée
        game.elFirstCard = null;

        // Rétablissement de l'autorisation de jouer
        game.canPlay = true;

    }, game.showTime );
};

/**
 * Retourne le DOM complet pour une carte en fonction l'id donné
 */
const getCardDOM = cardId => {
    // Code HTML à générer pour une carte
    /*
    <div class="card" data-id="CARD_ID" data-playable="1">
        <div class="card-back"></div>
        <div class="card-img" style="background-image:url('./assets/lidem-CARD_ID.jpg')"></div>
    </div>
    */

    // Création de l'élément DOM parent
    const elCard = document.createElement( 'div' );
    elCard.classList.add( 'card' );
    elCard.dataset.id = cardId;
    elCard.dataset.playable = 1;

    // Construction du code HTML interne
    let html = '<div class="card-back"></div>';
    html += `<div class="card-img" style="background-image:url('./assets/lidem-${cardId}.jpg')"></div>`;
    
    // Affectation du code HTML interne
    elCard.innerHTML = html;

    // Affectation d'un écouteur de l'événement "click"
    elCard.addEventListener( 'click', handlerCardClick );

    // Renvoi de l'élément DOM généré 
    return elCard;
};

// --- Gestion des scores ---
/**
 * Charge et affiche les scores
 */
const loadScores = _ => {
    
    // Réinitilisation du score et de l'affichage score / record (en cas de nouvelle partie)
    game.score = 0;
    game.elScore.textContent 
        = game.elHighscore.textContent
        = 0;
    
    // Récupération du record enregistré dans le stockage local du navigateur
    let highscore = localStorage.getItem( game.scoreStorage );
    
    // Aucun record enregistré ? => sortie de la fonction
    if( !highscore ) return;
    
    // On a arrive ici si un record a été récupéré du stockage
    // Initialisation du record après conversion en nombre (le stockage est sous forme de chaîne)
    game.highscore = parseInt( highscore, 10 );

    // Affichage du record
    game.elHighscore.textContent = game.highscore;

};

/**
 * Enregistre le un record dans le stockage local du navigateur
 */
const saveHighscore = _ => {

    localStorage.setItem( game.scoreStorage, game.highscore );

};

/**
 * Gestion de la remise à zéro du record
 */
const handlerResetHighscore = _ => {

    // Mise à zéro
    game.highscore = 0;

    // Enregistrement dans le stockage local (pour effacer un éventuel enregistrement)
    saveHighscore();

    // Affichage
    game.elHighscore.textContent = game.highscore;

};    


// --- Gestion de la partie ---
/**
 * Mélange aléatoire de la liste des cartes
 */
const shuffleCards = _ => {

    // L'Id de carte en cours commence par le plus grand disponible 
    let currentId = game.cards.length;

    // Variable de stockage d'un id aléatoire parmi ceux disponibles
    let randomId;

    // Tant que l'id de la carte en cours est positif
    while ( currentId > 0 ) {

        // Affectation d'un nombre entier aléatoire de 1 à l'id disponible le plus grand
        randomId = Math.floor( Math.random() * currentId );

        // Décrémentation de 1 de l'id de la carte en cours
        currentId --;

        // Interversion dans la liste de l'id de la carte en cours et de celle définie aléatoirement
        [ game.cards[ currentId ], game.cards[ randomId ] ] = [ game.cards[ randomId ], game.cards[ currentId ] ];
    }

};

/**
 * Affiche la liste des cartes
 */
const renderDeck = _ => {

    // Pour chaque carte de la liste on ajoute son élément DOM à la table
    for( let cardId of game.cards ) game.elDeck.append( getCardDOM( cardId ) );

};


/**
 * Lance une nouvelle partie
 */
const newGame = _ => {

    // Chargement des scores
    loadScores();

    // - En cas de nouvelle partie consécutive à une autre -
    // Vidange de la liste des cartes
    game.cards = [];

    // Remise à zéro du nombre de paires valides
    game.flippedPairs = 0;

    // Vidange de l'affichage des cartes
    game.elDeck.innerHTML = '';


    // - Génération du tableau de cartes -
    // On boucle autant de fois que de cartes distinctes
    // On ajoute 2 fois le même id pour obtenir des paires
    for( let i = 1; i <= game.distinctCards; i ++) game.cards.push( i, i );        

    // Mélange du tableau
    shuffleCards();

    // Affichage des cartes
    renderDeck();

};        


// --- Gestion du panneau victoire ---
/**
 * Gestion du lancement d'une nouvelle partie après victoire
 */
const handlerPlayAgain = _ => {

    // On ajoute la class CSS "hidden" au panneau victoire pour le cacher
    game.elWin.classList.add( 'hidden' );
    
    // Lancement d'une novelle partie
    newGame();

};        

/**
 * Gestion de la victoire
 */
const winGame = _ => {
    
    // Mise à jour du record s'il est à zéro ou supérieur au score
    if( game.score < game.highscore || game.highscore == 0 )  game.highscore = game.score;
    
    // Enregistrement du record dans le stockage local du navigateur
    saveHighscore();

    // Affichage du score dans le panneau victoire
    game.elWinScore.textContent = game.score;

    // Suppression de la class CSS "hidden" sur le panneau victoire pour le faire apparaître
    game.elWin.classList.remove( 'hidden' );
    
};


// --- Initialisation du jeu ---
/**
 * Initialise l'ensemble du jeu et lance une partie
 */
const init = _ => {

    // - Récupération dans le DOM des différents éléments -
    // Table de jeu
    game.elDeck = document.getElementById( 'deck' );
    
    // Afficheur du score
    game.elScore = document.getElementById( 'score' );
    
    // Afficheur du record
    game.elHighscore = document.getElementById( 'highscore' );

    // Bouton de remise à zéro du record
    game.elBtnClear = document.getElementById( 'btn-clear' );
    
    // Panneau victoire
    game.elWin = document.getElementById( 'win' );

    // Afficheur de score du panneau victoire
    game.elWinScore = document.getElementById( 'final-score' );
    
    // Bouton "Rejouer"
    game.elBtnAgain = document.getElementById( 'btn-again' );


    // - Assignation des écouteurs d'événements -
    // Clic sur le bouton de remise à zéro du record
    game.elBtnClear.addEventListener( 'click', handlerResetHighscore );

    // Clic sur le bouton "Rejouer" 
    game.elBtnAgain.addEventListener( 'click', handlerPlayAgain );


    // - Lancement d'une nouvell partie -
    newGame();

};

// Lancement du jeu lorsque le navigateur a terminé la construction du DOM à partir du code HTML
document.addEventListener( 'DOMContentLoaded', init );