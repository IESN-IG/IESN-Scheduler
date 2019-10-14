const express = require('express');
const router = express.Router();
const utils = require('../utils.js');
const sections = utils.getSections();
/*
    j'ai utilisé la variable "calendarURLRedirect" que je passe dans la view index.ejs qui me permet d'ajouter #calendarURL à l'URL après la redirection de la génération d'URL
        - ça permet d'attérir directement au niveau du champ de l'URL
        - je n'ai pas trouvé (impossible?) comment l'implémenter directement dans le "res.render('index', ...)"
 */

router.get('/:sectionName', function (req, res, next) {
    if(sections.includes(req.params.sectionName)){
        let selectList = utils.getSelectList(req.params.sectionName);
        res.render('section', {
            calendarURL: '',
            selectList: selectList,
            calendarURLRedirect: false,
            toastrNotif: false,
            section: req.params.sectionName
        });
    }else{
        res.render('index', {
            toastrNotif: true,
            toastrObject: {
                type: 'error',
                text: 'Une section incorrecte a été rentrée',
                timeout: 5000
            }
        });
    }

});

router.post('/:sectionName', function (req, res, next) {
    let selectList = utils.getSelectList(req.params.sectionName);
    if (!req.body.Classes) { // Aucun groupe sélectionné
        res.render('section', {
            calendarURL: '',
            selectList: selectList,
            calendarURLRedirect: false,
            toastrNotif: true,
            toastrObject: {
                type: 'error',
                text: 'Aucun groupe sélectionné',
                timeout: 5000
            },
            section: req.params.sectionName
        });
    } else {
        /* Génération (ou copie si plusieurs groupes sélectionnés de l'array contenant les groupes */
        let classes = [];
        if (!Array.isArray(req.body.Classes)) {
            classes.push(req.body.Classes);
        } else {
            classes = req.body.Classes;
        }

        /* Idem mais avec les cours */
        let courses = [];
        if (!Array.isArray(req.body.Courses)) {
            courses.push(req.body.Courses);
        } else {
            courses = req.body.Courses;
        }

        const paramCrsFull = utils.getFullParamsCours(courses);

        res.render('section', {
            calendarURL: `https://iesn.thibaultclaude.be/calendar/${req.params.sectionName}?${classes.map(classe => `grp[]=${classe}`).join('&')}${paramCrsFull}`,
            selectList: selectList,
            calendarURLRedirect: true,
            toastrNotif: true,
            toastrObject: {
                type: 'success',
                text: 'Calendrier généré avec succès',
                timeout: 2000
            },
            section: req.params.sectionName
        });
    }
});

module.exports = router;
