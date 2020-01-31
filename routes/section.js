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
    if (sections.includes(req.params.sectionName)) {
        let selectList = req.params.sectionName === 'IG' ? utils.getSelectList(req.params.sectionName) : null;
        utils.renderTemplate(res, req, 'section', {
            section: req.params.sectionName,
            selectList: selectList,
            calendarURL: req.flash('calendarURL'),
            toCalendarURL: req.flash('toCalendarURL'),
            title: "Section " + req.params.sectionName,
            classes: utils.getClasses(req.params.sectionName),
            hasBloc1: utils.determineIfSectionHasBloc(req.params.sectionName, 1),
            hasBloc2: utils.determineIfSectionHasBloc(req.params.sectionName, 2),
            hasBloc3: utils.determineIfSectionHasBloc(req.params.sectionName, 3)
        });
    } else {
        req.flash('errorToast', 'Une mauvaise section a été entrée');
        res.redirect('/');
    }

});

router.post('/:sectionName', function (req, res, next) {
    let selectList = utils.getSelectList(req.params.sectionName);
    if (!req.body.Classes) { // Aucun groupe sélectionné
        req.flash('errorToast', 'Aucun groupe sélectionné');
        res.redirect('/');
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

        req.flash('successToast', 'Calendrier généré avec succès');
        req.flash('calendarURL', `https://iesn.thibaultclaude.be/calendar/${req.params.sectionName}?${classes.map(classe => `grp[]=${classe}`).join('&')}${paramCrsFull}`);
        req.flash('toCalendarURL', true);

        res.redirect('/section/' + req.params.sectionName);
    }
});

module.exports = router;
