const express = require('express');
const router = express.Router();
const classes = require('../classes.json');
const blocs = require('../blocs.json');
const credentials = require('../credentials.json');
const fetch = require("node-fetch");
const ical = require("ical-generator");
const coursMobileWeb = Array.from(require('../settings.json').coursOptionWeb);
const datePattern = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/;
const grpDataIntelligence = require('../settings.json').groupeDataIntelligence;

// Structure message à envoyer en cas d'erreur lors du fetch
let discordMessage = {
    content: `<@${credentials.idDiscord}>`,
    avatar_url: "https://portail.henallux.be/favicon-96x96.png",
    username: "IESNScheduler"
};

let listeCours; /* Contiendra la liste des cours que l'utilisateur veut suivre */
let jsonCours; /* Contiendra la réponse de l'API Horaire clean des cours inutiles/non suivis */
let coursCommuns; /* Contiendra les cours communs / déjà rencontrés pour ne pas avoir de doublons dans l'horaire */
let isBloc1; // L'utilisateur est du bloc 1
let isBloc2; // L'utilisateur est du bloc 2
let isBloc3; // L'utilisateur est du bloc 3

router.get('/', function (req, res, next) {
    coursCommuns = new Set();
    listeCours = [];
    let calendar = ical({name: "Cours", timezone: "Europe/Brussels"});

    if (req.query.grp.every(groupe => Object.keys(classes).includes(groupe))) { /* Check que les groupes existent bien dans le fichier JSON */
        determinerBlocs(req.query.grp);
        remplirListeCours(req.query.crs1, req.query.crs2, req.query.crs3);

        let fetchURLParams = `[${req.query.grp.map(groupe => `%22${getModifiedParams(classes[groupe])}%22`).join(', ')}]`; /* Mets au bon format les groupes avant la requête */

        fetch(`https://portail.henallux.be/api/plannings/promotion/${fetchURLParams}`, {
            "method": "GET",
            "headers": {
                "authorization": `Bearer ${credentials.bearerPortail}`
            }
        }).then(response => {
            response.json()
                .then(resFormatted => {
                    jsonCours = req.query.grp.includes(grpDataIntelligence) ? resFormatted.filter(cleanCoursData) : resFormatted.filter(cleanCours); /* Si l'option est Data Intelligence, alors on enlève les cours de l'option web par défaut (merci henallux d'avoir bien fait les horaires)*/
                    for (let cours of jsonCours) {
                        if (cours.start && cours.end) {
                            calendar.createEvent({
                                start: new Date(cours.start.replace(datePattern, "$1-$2-$3T$4:$5:$6")),
                                end: new Date(cours.end.replace(datePattern, "$1-$2-$3T$4:$5:$6")),
                                location: cours.location,
                                summary: cours.title,
                                description: cours.details
                            });
                        }
                    }
                    calendar.serve(res);
                })
                .catch(err => {
                    /* Error lors du passage de response en json */
                    console.log(err)
                })
        })
            .catch(err => {
                /*
                Error lors du fetch
                    - Arrivera quand ils vont "reset" le compteur (+930 aux codes des groupes tous les jours) ou si le site est down..
                    - Envoie un message discord quand l'erreur se produit
                */
                discordMessage.embeds = [{
                    title: "Fetch Error",
                    color: 16723200,
                    timestamp: new Date(Date.now()),
                    fields: [
                        {
                            name: "Error messsage",
                            value: err
                        }
                    ]
                }];

                fetch(credentials.webhookURL, {
                    method: 'post',
                    body: JSON.stringify(discordMessage),
                    headers: { 'Content-Type': 'application/json' },
                }).catch(err => console.log(err));
            })
    } else {
        /* Au moins un groupe entré est invalide => On génère pas de calendrier, on fait pas de fetch*/
    }
});

/*
    Retourne le bon code du groupe en fonction de la date
    L'update se fait à 6h
    @Arthur Detroux
 */
function getModifiedParams(params) {
    const init_date = new Date('September 20, 2019 06:00:00');
    const one_day = 1000 * 60 * 60 * 24;

    let now = new Date();
    let diff_ms = now - init_date;
    let nb_Days = Math.floor(diff_ms / one_day);

    let add_code = nb_Days * 930;

    let tempNumber = Number(params) + add_code;

    return "" + tempNumber;
}

/*
    On remplit la liste de cours :
        - S'il est dans un bloc, on check si les cours si il a choisi des cours ou qu'il y a all => On ajoute tout
        - Sinon, on parcours la liste des cours sélectionnés et on les ajoute
 */
function remplirListeCours(cours1, cours2, cours3) {
    if (isBloc1) {
        addCoursToListe(cours1,1);
    }

    if (isBloc2) {
        addCoursToListe(cours2,2);
    }

    if (isBloc3) {
        addCoursToListe(cours3,3);
    }
}

/*
    Clean la liste des cours avec les cours utiles & évite les doublons (cours généraux) si plusieurs groupes du même blocs sont sélectionnés

    Amélioration :
        - Mettre direct le JSON dans le Set ? Possible/utile ? Enlèverai automatiquement les doublons
 */
function cleanCours(cours) {
    let transformedString = `${cours.start}/${cours.end}/${cours.location}/${cours.title}/${cours.details}`; // On crée une chaîne uniquement
    let crsCommun = coursCommuns.has(transformedString); // On regarde si notre Set a déjà cette chaine (=> cours qui a déjà été mis dans le calendrier)
    if (!crsCommun) {
        coursCommuns.add(transformedString);
    }
    let code = cours.text.substring(0, 5); // On chope l'ID du cours
    return (listeCours.some(c => code === c) || code.substring(0, 2).toUpperCase() !== 'IG') && !crsCommun; // On check si le cours est dans la liste de cours choisis (OU si il ne commence pas par un code, ex Team Building) et que ce n'est pas un cours commun (déjà ajouté)
}

/* Enlève les cours de l'option Web dans l'horaire des Data*/
function cleanCoursData(cours) {
    let code = cours.text.substring(0, 5);
    return cleanCours(cours) && !coursMobileWeb.includes(code);
}

function determinerBlocs(groupes){
    isBloc1 = groupes.some(groupe => groupe.substring(0, 1) === '1');
    isBloc2 = groupes.some(groupe => groupe.substring(0, 1) === '2');
    isBloc3 = groupes.some(groupe => groupe.substring(0, 1) === '3');
}

function addCoursToListe(coursParams, numBloc){
    if (!coursParams || coursParams.includes("all")) {
        for (bloc of Object.values(blocs[numBloc])) {
            listeCours.push("IG" + bloc);
        }
    } else {
        coursParams.forEach(cours => {
            listeCours.push("IG" + cours);
        })
    }
}

module.exports = router;
