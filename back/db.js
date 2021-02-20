const db = require('quick.db');
const defaultSettings = require("./default-settings.json");
const iesnData = require("./IESN.json");
require("dotenv").config();

/**
 * Retourne les settings
 * @method
 * @returns {Object}
 * @category Database
 */
const getSettings = () => db.get(`${process.env.DB_PREFIX}.settings`) || {};

/**
 * Initialise la BDD au démarrage
 * @method
 * @returns {void}
 * @category Database
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
 * @method
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
 * @category Database
 */
const getSectionDataBySection = (section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}`);

/**
 * Retourne les informations du bloc et de la section donnés
 * @method
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {Object}
 * @example
 *  getSectionDataBySectionAndBloc(1, "IG");
 *  //  return :
 *      {
 *          groups: [...],
 *          classes: [{..}]
 *      }
 * @category Database
 */
const getSectionDataBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}`);

/**
 * Retourne les groupes disponibles du bloc et de la section donnés
 * @method
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @example
 *  getGroupsBySectionAndBloc(1, "IG"); // ["A", "B", "C", "D", "E"]
 * @category Database
 */
const getGroupsBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}.groups`);

/**
 * Retourne les cours disponibles du bloc et de la section donnés
 * @method
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
 * @category Database
 */
const getClassesBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}.classes`);

/**
 * Retourne les sections disponibles
 * @method
 * @returns {string[]} Sections disponibles
 * @example
 *  getSections(); // ["IG", "MK"]
 * @category Database
 */
const getSections = () => Object.keys(db.get(`${process.env.DB_PREFIX}.globalSectionsData`));

/**
 * Retournes les blocs disponibles pour une section donnée 
 * @method
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @example
 *  getBlocsBySection("IG"); // ["1", "2", "3"]
 * @category Database
 */
const getBlocsBySection = (section = "IG") => Object.keys(db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}`));

/**
 * Retourne tous les combos blocs + groupes valides pour la section donnée
 * @method
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @example
 *  getValidBlocsAndGroupsBySection("IG"); // ["1A", "1B", ..., "2A", "2B", "3A", "3B"]
 * @category Database
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
 * @method
 * @param {string} key 
 * @returns {string|number}
 * @category Database
 */
const getSettingByKey = (key) => db.get(`${process.env.DB_PREFIX}.settings.${key}`);

/**
 * Retourne les codes API enregistrés
 * @method
 * @returns {Object}
 * @category Database
 */
const getCurrentCodes = () => db.get(`${process.env.DB_PREFIX}.codes`) || {};

/**
 * Mets à jour les codes API enregistrés
 * @method
 * @param {Object} codes 
 * @returns {void}
 * @category Database
 */
const setCurrentCodes = (codes) => db.set(`${process.env.DB_PREFIX}.codes`, codes);

module.exports = { setCurrentCodes, getCurrentCodes, initDatabase, getSettings, getSettingByKey, getValidBlocsAndGroupsBySection }