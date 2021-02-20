/**
 * Toutes les méthodes intéragissant avec la database
 * @module db
 */

const db = require('quick.db');
const defaultSettings = require("../default-settings.json");
const iesnData = require("../IESN.json");
require("dotenv").config();

/**
 * Retourne les settings
 * @returns {Object}
 */
const getSettings = () => db.get(`${process.env.DB_PREFIX}.settings`) || {};

/**
 * Initialise la BDD au démarrage
 * @returns {void}
 */
const initDatabase = () => {
    const currentSettings = getSettings();
    const defaultSettingsKeys = Object.keys(defaultSettings);
    defaultSettingsKeys.forEach(settingsKey => {
        if(!currentSettings[settingsKey]) 
            db.set(`${process.env.DB_PREFIX}.settings.${settingsKey}`, defaultSettings[settingsKey]);
    })
    db.set(`${process.env.DB_PREFIX}.globalSectionsData`, iesnData);
}

/**
 * Retourne les informations complètes de la section donnée
 * @param {string} [section=IG] 
 * @returns {Object}
 * @example
 *  getSectionDataBySection("IG");
 *  // return : 
 *  {
 *      "1": {
 *          groups: [...],
 *          classes: [{..}]
 *      },
 *      "2": {
 *          groups: [...],
 *          classes: [{..}]
 *      },
 *      "3": {
 *          groups: [...],
 *          classes: [{..}]
 *      }
 *  }
 */
const getSectionDataBySection = (section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}`);

/**
 * Retourne les informations du bloc et de la section donnés
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {Object}
 * @example
 *  getBlocDataBySectionAndBloc(1, "IG");
 *  //  return :
 *      {
 *          groups: [...],
 *          classes: [{..}]
 *      }
 */
const getBlocDataBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}`);

/**
 * Retourne les groupes disponibles du bloc et de la section donnés
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @example
 *  getGroupsBySectionAndBloc(1, "IG"); // ["A", "B", "C", "D", "E"]
 */
const getGroupsBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}.groups`);

/**
 * Retourne les cours disponibles du bloc et de la section donnés
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {Object[]}
 * @example
 *  getClassesBySectionAndBloc(1, "IG"); 
 * // return :
 * [{
        "section": "IG",
        "id": "123",
        "displayName": "Description des ordinateurs",
        "completeName": "IG123 - Description des ordinateurs",
        "optional": false,
        "classes": [
            {
                "id": "NARO1",
                "displayName": "Architecture des ordinateurs",
                "completeName": "NARO1 - Architecture des ordinateurs"
            },
            {
                "id": "NEEO1",
                "displayName": "Expression écrite et orale",
                "completeName": "NEEO1 - Expression écrite et orale"
            }
        ],
        "aliases": null
    }]
 */
const getClassesBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}.classes`);

/**
 * Retourne les sections disponibles
 * @returns {string[]} Sections disponibles
 * @example
 *  getSections(); // ["IG", "MK"]
 */
const getSections = () => Object.keys(db.get(`${process.env.DB_PREFIX}.globalSectionsData`));

/**
 * Retournes les blocs disponibles pour une section donnée 
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @example
 *  getBlocsBySection("IG"); // ["1", "2", "3"]
 */
const getBlocsBySection = (section = "IG") => Object.keys(db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}`));

/**
 * Retourne tous les combos blocs + groupes valides pour la section donnée
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @example
 *  getValidBlocsAndGroupsBySection("IG"); // ["1A", "1B", ..., "2A", "2B", "3A", "3B"]
 */
const getValidBlocsAndGroupsBySection = (section = "IG") => {
    const blocs = getBlocsBySection(section);
    return blocs.reduce((accumulator, blocNumber) => {
        accumulator.push(...getGroupsBySectionAndBloc(blocNumber, section).map(grpLetter => blocNumber + grpLetter))
        return accumulator;
    }, [])
}

/**
 * Retourne le paramètre lié à la clé donnée
 * @param {string} key 
 * @returns {string|number}
 */
const getSettingByKey = (key) => db.get(`${process.env.DB_PREFIX}.settings.${key}`);

/**
 * Retourne les codes API enregistrés
 * @returns {Object}
 */
const getCurrentCodes = () => db.get(`${process.env.DB_PREFIX}.codes`) || {};

/**
 * Mets à jour les codes API enregistrés
 * @param {Object} codes 
 * @returns {void}
 */
const setCurrentCodes = (codes) => db.set(`${process.env.DB_PREFIX}.codes`, codes);

module.exports = { 
    setCurrentCodes, 
    getCurrentCodes, 
    initDatabase, 
    getSettings, 
    getSettingByKey, 
    getValidBlocsAndGroupsBySection, 
    getSectionDataBySection, 
    getBlocDataBySectionAndBloc,
    getClassesBySectionAndBloc,
    getSections,
    getGroupsBySectionAndBloc 
}