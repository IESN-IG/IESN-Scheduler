const express = require('express');
const router = express.Router();
const utils = require('../utils');
/*
    j'ai utilisé la variable "calendarURLRedirect" que je passe dans la view index.ejs qui me permet d'ajouter #calendarURL à l'URL après la redirection de la génération d'URL
        - ça permet d'attérir directement au niveau du champ de l'URL
        - je n'ai pas trouvé (impossible?) comment l'implémenter directement dans le "res.render('index', ...)"
 */

router.get('/', function (req, res, next) {
    utils.renderTemplate(res, req, 'index', {title: "Accueil"});
});


module.exports = router;
