const credentials = require('./credentials.json');
const axios = require('axios');
const blocs = require('./blocs.json');
const _ = require('lodash');
const path = require('path');
const sections = require('./sections');
const axiosPortailLog = axios.create({
    baseURL: 'https://portail.henallux.be/api/',
    timeout: 15000,
    headers: {
        'Authorization': 'Bearer ' + credentials.bearerPortail,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36'
    }
});

let currentCodes;

module.exports = {
    load: () => {
        module.exports.updateClassesCodes(true);
    },

    sendDiscordMessage: (message, isErr = true) =>{
        const discordMessage = {
            content: isErr ? `<@${credentials.idDiscord}>` : "",
            avatar_url: "https://portail.henallux.be/favicon-96x96.png",
            username: "IESNScheduler",
            title: isErr ? "Error" : "Information",
            embeds: [{
                timestamp: new Date(Date.now()),
                color: isErr ? 16723200 : 51980,
                fields: [
                    {
                        name: "Message",
                        value: message
                    }
                ]
            }]
        };

        axios({
            method: 'post',
            url: credentials.webhookURL,
            data: JSON.stringify(discordMessage),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    updateClassesCodes: (onLoad = false) => {
        searchClassesCodes()
            .then(res => {
                if (!_.isEqual(currentCodes, res)) {
                    currentCodes = res;
                    module.exports.sendDiscordMessage(onLoad ? "Codes added to cache" : "Codes updated", false);
                }
            })
            .catch(err => {
                module.exports.sendDiscordMessage("Error when searching codes " + err);
            })
    },

    getSelectList: (section) => {
        let selectList = {1: [], 2: [], 3: []};
        /* Parcours du fichiers "blocs.json" pour préparer une liste qui sera utilisée pour remplir les selectss dans la view index.ejs */
        for(let i = 0; i < blocs[section].length; i++){
            for (let courses in blocs[section][i]) {
                let tempSelect = {
                    value: blocs[section][i][courses],
                    text: courses
                };
                selectList[(i+1)].push(tempSelect);
            }
        }
        return selectList;
    },

    getFullParamsCours: (courses, languages) => {
        /*
        Parcours des cours sélectionnés pour la génération des String pour les paramètres URL
            - A revoir ?
        */
        let tempCrs1 = courses.filter(crs => crs === "1" || (crs >= 100 && crs <= 199));
        let paramCrs1 = `${tempCrs1.includes("1") ? 'crs1[]=all' : tempCrs1.map(crs => `crs1[]=${crs}`).join('&')}`;
        let tempCrs2 = courses.filter(crs => crs === "2" || (crs >= 200 && crs <= 299));
        let paramCrs2 = `${tempCrs2.includes("2") ? 'crs2[]=all' : tempCrs2.map(crs => `crs2[]=${crs}`).join('&')}`;
        let tempCrs3 = courses.filter(crs => crs === "3" || (crs >= 300 && crs <= 399));
        let paramCrs3 = `${tempCrs3.includes("3") ? 'crs3[]=all' : tempCrs3.map(crs => `crs3[]=${crs}`).join('&')}`;
        let tempLanguage2 = languages[0] ? languages.filter(lang => lang.substring(--lang.length) === "2") : [];
        let paramLang2 = tempLanguage2.map(lang => `optl2=${lang}`).join('&');
        let tempLanguage3 = languages[0] ? languages.filter(lang => lang.substring(--lang.length) === "3") : [];
        let paramLang3 = tempLanguage3.map(lang => `optl3=${lang}`).join('&');

        /*
            Concatenation des paramètres précédemment créés
                - A revoir?
         */

        let paramCrsFull = (paramCrs1 && paramCrs1.length > 0) ? '&' + paramCrs1 : '';
        paramCrsFull += (paramCrs2 && paramCrs2.length > 0) ? '&' + paramCrs2 : '';
        paramCrsFull += (paramCrs3 && paramCrs3.length > 0) ? '&' + paramCrs3 : '';
        paramCrsFull += (paramLang2 && paramLang2.length > 0) ? '&' + paramLang2 : '';
        paramCrsFull += (paramLang3 && paramLang3.length > 0) ? '&' + paramLang3 : '';

        return paramCrsFull
    },

    getCurrentCodes: (section) => {
        return currentCodes[section];
    },

    getAxiosPortailLog: () => {
        return axiosPortailLog;
    },

    getSections: () => {
        return Object.keys(sections);
    },

    renderTemplate: (res, req, template, data = {}) => {
        const baseData = {
            path: req.path,
            active: template,
            errorMsg: req.flash('errorToast'),
            successMsg: req.flash('successToast'),
            infoMsg: req.flash('infoToast'),
            sections: sections
        };
        res.render(path.resolve(`./views/${template}`), Object.assign(baseData, data));
    },

    // Permet de vérifier si une section a un bloc : exemple la section CF n'a pas le bloc 1
    determineIfSectionHasBloc(section, bloc) {
        let classes = module.exports.getClasses(section);
        return classes.includes(bloc + 'A')
    },

    getClasses(section) {
        let currCodes = module.exports.getCurrentCodes(section);
        return Object.keys(currCodes);
    }
};

function searchClassesCodes() {
    return new Promise(async (resolve, reject) => {
        let updatedJson = {};
        let sectionsKeys = module.exports.getSections();
        try {
            for(let section of sectionsKeys){
                updatedJson[section] = {};
                let resBlocsID = await axiosPortailLog.get(`https://portail.henallux.be/api/classes/orientation_and_implantation/${sections[section].id}/1`, {
                    transformResponse: [function (data) {
                        let jsonData = JSON.parse(data);
                        return jsonData.data.map(item => item.id)
                    }]
                });

                for (let bloc of resBlocsID.data) {
                    let resClassesID = await axiosPortailLog.get(`https://portail.henallux.be/api/classes/classe_and_orientation_and_implantation/${bloc}/${sections[section].id}/1`, {
                        transformResponse: [function (data) {
                            let jsonData = JSON.parse(data);
                            return jsonData.data.filter(grp => grp.classe);
                        }]
                    });
                    for (let classe of resClassesID.data) {
                        let classeID = classe.annee.charAt(0) + classe.classe;
                        updatedJson[section][classeID] = classe.id
                    }
                }
            }
            resolve(updatedJson);
        } catch (e) {
            reject(e);
        }
    })
}