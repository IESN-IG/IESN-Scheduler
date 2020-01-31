const express = require('express');
const router = express.Router();
const utils = require('../utils.js');
const blocs = require('../blocs.json');
const ical = require("ical-generator");
const mobileWebCourses = Array.from(require('../settings.json').webOptionCourses);
const patternDate = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/;
const patternCourse = /([a-zA-Zé /]+)/
const dataIntelligenceGroupe = require('../settings.json').dataIntelligenceClasse;
const languagesCourses = require('../settings.json').languagesCourses;
const labelALNL = require('../settings.json').labelALNL;
const labelEN = require('../settings.json').labelENRenfort;
const axiosPortailLog = utils.getAxiosPortailLog();

let courses; /* Contiendra la liste des cours que l'utilisateur veut suivre */
let coreCourses; /* Contiendra les cours communs / déjà rencontrés pour ne pas avoir de doublons dans l'horaire */
let isBloc1; // L'utilisateur est du bloc 1
let isBloc2; // L'utilisateur est du bloc 2
let isBloc3; // L'utilisateur est du bloc 3
let langOpt2;
let langOpt3;
let sectionName;

// On redirige les anciennes requêtes vers le nouveau 'format'
router.get('/', function (req, res, next) {
    res.redirect('/calendar/IG' + req.url.substring(1));
});

router.get('/:sectionName', function (req, res, next) {
    sectionName = req.params.sectionName;
    coreCourses = new Set();
    courses = [];
    let classesCodes = utils.getCurrentCodes(sectionName);

    let calendar = ical({name: "Cours", timezone: "Europe/Brussels"});

    if (req.query.grp.every(group => Object.keys(classesCodes).includes(group))) { /* Check que les groupes existent bien dans le fichier JSON */
        // Seulement utile pour la personnalisation de l'horaire IG
        if (sectionName === 'IG') {
            langOpt2 = req.query.optl2;
            langOpt3 = req.query.optl3;
            blocsDetermine(req.query.grp);
            fillCourses(req.query.crs1, req.query.crs2, req.query.crs3);
        }

        let fetchURLParams = `[${req.query.grp.map(group => `%22${classesCodes[group]}%22`).join(', ')}]`; /* Mets au bon format les groupes avant la requête */
        axiosPortailLog.get(`https://portail.henallux.be/api/plannings/promotion/${fetchURLParams}`, {
            transformResponse: [function (data) {
                let jsonData = JSON.parse(data);
                return (sectionName === 'IG') ? ((req.query.grp.includes(dataIntelligenceGroupe)) ? jsonData.filter(cleanCoursesDataOption) : jsonData.filter(cleanCourses)) : jsonData/* Si l'option est Data Intelligence, alors on enlève les cours de l'option web par défaut (merci henallux d'avoir bien fait les horaires)*/
            }]
        })
            .then(response => {
                for (let course of response.data) {
                    if (course.start && course.end) {
                        calendar.createEvent({
                            start: new Date(course.start.replace(patternDate, "$1-$2-$3T$4:$5:$6")),
                            end: new Date(course.end.replace(patternDate, "$1-$2-$3T$4:$5:$6")),
                            location: course.location,
                            summary: course.title,
                            description: course.details
                        });
                    }
                }
                calendar.serve(res);
            })
            .catch(err => {
                utils.sendDiscordMessage("Error fetch calendar.js " + err);
                utils.updateClassesCodes();
            })
    } else {
        req.flash('errorToast', 'Un groupe non validé a été rentré');
        res.redirect('/');
    }
});

/*
    On remplit la liste de cours :
        - S'il est dans un bloc, on check si les cours si il a choisi des cours ou qu'il y a all => On ajoute tout
        - Sinon, on parcours la liste des cours sélectionnés et on les ajoute
 */
function fillCourses(course1, course2, course3) {
    if (isBloc1) addCourse(course1,1);
    if (isBloc2) addCourse(course2,2);
    if (isBloc3) addCourse(course3,3);
}

/*
    Clean la liste des cours avec les cours utiles & évite les doublons (cours généraux) si plusieurs groupes du même blocs sont sélectionnés

    Amélioration :
        - Mettre direct le JSON dans le Set ? Possible/utile ? Enlèverai automatiquement les doublons
 */
function cleanCourses(course) {
    let transformedString = `${course.start}/${course.end}/${course.location}/${course.title}/${course.details}`; // On crée une chaîne uniquement
    let coreCourse = coreCourses.has(transformedString); // On regarde si notre Set a déjà cette chaine (=> cours qui a déjà été mis dans le calendrier)
    if (!coreCourse) {
        coreCourses.add(transformedString);
    }
    let codeCourse = course.text.substring(0, 5); // On chope l'ID du cours
    let languageOption;
    if (languagesCourses.includes(codeCourse)) {
        languageOption = cleanLanguageCourse(course.text)
    }
    return (courses.some(c => codeCourse === c) || codeCourse.substring(0, 2).toUpperCase() !== 'IG') && !coreCourse && !languageOption; // On check si le cours est dans la liste de cours choisis (OU si il ne commence pas par un code, ex Team Building) et que ce n'est pas un cours commun (déjà ajouté)
}

/* Enlève les cours de l'option Web dans l'horaire des Data*/
function cleanCoursesDataOption(course) {
    let codeCourse = course.text.substring(0, 5);
    return cleanCourses(course) && !mobileWebCourses.includes(codeCourse);
}

function cleanLanguageCourse(course) {
    let stringMatch = course.substring(6).match(patternCourse)[0];
    stringMatch = stringMatch.substring(0, --stringMatch.length);
    let returnValue;
    if (langOpt2) {
        if (langOpt2.includes('ALNL')) {
            returnValue = labelEN.includes(stringMatch)
        } else {
            returnValue = labelALNL.includes(stringMatch)
        }
    }

    if (langOpt3) {
        if (langOpt3.includes('ALNL')) {
            returnValue = labelEN.includes(stringMatch)
        } else {
            returnValue = labelALNL.includes(stringMatch)
        }
    }

    return returnValue;
}

function blocsDetermine(classes) {
    isBloc1 = classes.some(classe => classe.substring(0, 1) === '1');
    isBloc2 = classes.some(classe => classe.substring(0, 1) === '2');
    isBloc3 = classes.some(classe => classe.substring(0, 1) === '3');
}

function addCourse(courseParams, blocNum) {
    if (!courseParams || courseParams.includes("all")) {
        for (let bloc of Object.values(blocs[sectionName][(blocNum - 1)])) {
            courses.push(sectionName + bloc);
        }
    } else {
        courseParams.forEach(course => {
            courses.push(sectionName + course);
        })
    }
}

module.exports = router;
