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
 * @category Database
 */
const getSectionDataBySection = (section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}`);

/**
 * Retourne les informations du bloc et de la section donnés
 * @method
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {Object}
 * @category Database
 */
const getSectionDataBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}`);

/**
 * Retourne les groupes disponibles du bloc et de la section donnés
 * @method
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {string[]}
 * @category Database
 */
const getGroupsBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}.groups`);

/**
 * Retourne les cours disponibles du bloc et de la section donnés
 * @method
 * @param {string|number} bloc 
 * @param {string} [section=IG] 
 * @returns {Object[]}
 * @category Database
 */
const getClassesBySectionAndBloc = (bloc, section = "IG") => db.get(`${process.env.DB_PREFIX}.globalSectionsData.${section}.${bloc}.classes`);

/**
 * Retourne les sections disponibles
 * @method
 * @returns {string[]} Sections disponibles
 * @category Database
 */
const getSections = () => Object.keys(db.get(`${process.env.DB_PREFIX}.globalSectionsData`));

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

module.exports = { setCurrentCodes, getCurrentCodes, initDatabase, getSettings, getSettingByKey }