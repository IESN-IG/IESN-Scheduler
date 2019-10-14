const credentials = require('./credentials.json');
const axios = require('axios');
const blocs = require('./blocs.json');
//console.log(blocs.IG[2].TroncCommun)
const _ = require('lodash');
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
            data: JSON.stringify(discordMessage)
        });
    },

    updateClassesCodes: (onLoad = false) => {
        searchClassesCodes()
            .then(res => {
                let reqCodes = JSON.stringify(res);

                if(!_.isEqual(currentCodes, reqCodes)){
                    currentCodes = reqCodes;
                    module.exports.sendDiscordMessage(onLoad ? "Codes added to cache" : "Codes updated", false);
                }
            })
            .catch(err => {
                module.exports.sendDiscordMessage("Error when searching codes " + err);
            })
    },

    getSelectList: () => {
        let selectList = {1: [], 2: [], 3: []};
        /* Parcours du fichiers "blocs.json" pour préparer une liste qui sera utilisée pour remplir les selectss dans la view index.ejs */
        for (let bloc in blocs) {
            for (let courses in blocs[bloc]) {
                let tempSelect = {
                    value: blocs[bloc][courses],
                    text: courses
                };
                selectList[bloc].push(tempSelect);
            }
        }
        return selectList;
    },

    getFullParamsCours: (courses) => {
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

        /*
            Concatenation des paramètres précédemment créés
                - A revoir?
         */
        let paramCrsFull = (paramCrs1 && paramCrs1.length > 0) ? '&' + paramCrs1 : '';
        paramCrsFull += (paramCrs2 && paramCrs2.length > 0) ? '&' + paramCrs2 : '';
        paramCrsFull += (paramCrs3 && paramCrs3.length > 0) ? '&' + paramCrs3 : '';

        return paramCrsFull
    },

    getCurrentCodes: () => {
        return JSON.parse(currentCodes);
    },

    getAxiosPortailLog: () => {
        return axiosPortailLog;
    }
};

function searchClassesCodes() {
    return new Promise(async (resolve, reject) => {
        let updatedJson = {};
        try {
            let resBlocsID = await axiosPortailLog.get('https://portail.henallux.be/api/classes/orientation_and_implantation/6/1', {
                transformResponse: [function (data) {
                    let jsonData = JSON.parse(data);
                    return jsonData.data.map(item => item.id)
                }]
            });

            for (let bloc of resBlocsID.data) {
                let resClassesID = await axiosPortailLog.get(`https://portail.henallux.be/api/classes/classe_and_orientation_and_implantation/${bloc}/6/1`, {
                    transformResponse: [function (data) {
                        let jsonData = JSON.parse(data);
                        return jsonData.data.filter(grp => grp.classe);
                    }]
                });
                for (let classe of resClassesID.data) {
                    let classeID = classe.annee.charAt(0) + classe.classe;
                    updatedJson[classeID] = classe.id;
                }
            }
            resolve(updatedJson);
        } catch (e) {
            reject(e);
        }
    })
}