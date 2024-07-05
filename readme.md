
# L'IDEM Memory

Jeu de Memory (paires de cartes) en **HTML**, **CSS**, et **Javascript**.

Tester le jeu : https://lidem-admin-github.github.io/demo-js-memory/

## Déroulement du jeu

Le but du jeu est de retrouver toutes les paires de cartes indentiques en utilisant le moins de tentatives possible.<br>
Une tentative correspond au fait de retourner 2 cartes.

Après chaque tentative il y a 2 conséquences possibles:

- **Echec :** Les 2 cartes restent affichées 1 seconde, puis se retournent automatiquement.
- **Réussite :** Les 2 cartes restent visibles.

Lorsque toutes les paires ont été trouvées le nombre de tentative est enregistré. Le meilleur score est conservé entre les parties et enregistré dans dans le navigateur pour la prochaine session de jeu.

---

## Affichage

L'affichage est entièrement géré en **HTML** et **CSS**, y compris les animations.

Chaque carte est un assemblage de 2 faces sous forme de ``<div>`` stylisés par des transformations CSS (pour les afficher dos à dos).<br>
Leur retournement est géré par une transition animée déclenchée par l'ajout d'une classe CSS par le code Javascript.

---

## Logique

1. **Initialisation du jeu**
   - Récupération des éléments HTML nécessaires.
   - Affectation du code au clic de certains éléments fixes (boutons).
2. **Démarrage d'une partie**
   - Chargement du meilleur score (si enregistré lors d'une session de jeu précedente).
   - Remise à zéro de l'éventuelle partie de jeu précedente.
   - Création et mélange des identifiants de la liste des cartes.
   - Création des éléments HTML de chaque carte avec affectation du code au clic de chacune.
3. **Logique de chaque clic :**
   - S'il s'agit de la **1ère carte** de la tentative : 
     - Ajout de la classe CSS ``.flipped`` pour la retourner.
     - Enregistrement de son identifiant pour pouvoir le comparer avec celui de la 2ème carte.
   - S'il s'agit de la **2ème carte** de la tentative :
     - Incrémentation de 1 du compteur de tentatives.
     - Ajout de la classe CSS ``.flipped`` pour la retourner.
     - Comparaison de son identifiant avec celui de la 1ère carte :
       - S'ils sont identiques :
         - Incrémentation du compteur de nombre de paires trouvées :
           - Si c'est la dernière paire :
             - Mise à jour du meilleur score si besoin.
             - Affichage du panneau victoire qui propose de relancer une partie.
           - S'il reste encore des paires à trouver : Poursuite du jeu.
       - S'ils sont différents :
         - Lancement du minuteur qui remet les 2 cartes en place au bout de 1 seconde.

---

## Conclusion

La logique est décrite de manière plus détaillée dans les **commentaires du code Javascript**.
