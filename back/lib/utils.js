/**
 * Différents utilitaires utilisés dans l'app
 * @module utils
 */
const { getSettingByKey, getSectionDataBySection, getClassesBySectionAndBloc, getGroupsBySectionAndBloc } = require("./db.js");
const axios = require("axios");
require("dotenv").config();

/**
 * Compare 2 objets et retourne s'ils sont égaux ou non
 * @param {Object} object1 Objet à comparer au deuxième objet
 * @param {Object} object2 Objet à comparer au premier objet
 * @returns {boolean}
 */
const objectsAreEquals = (object1, object2) => {
  const object1Keys = Object.keys(object1);
  const object2Keys = Object.keys(object2);
  const object1Values = Object.values(object1);
  const object2Values = Object.values(object2);

  return (
    object1Keys.length === object2Keys.length &&
    object1Values.every((value) => object2Values.includes(value))
  );
};

/**
 * Contenu du message Discord
 * @typedef {Object} ContenuDiscord
 * @property {string} title
 * @property {string} text
 */
/**
 * Envoie un webhook Discord
 * @param {ContenuDiscord} contenuDiscord - Contenu du message à envoyer ({@link ContenuDiscord})
 * @param {boolean} [isError=true] - Le message a envoyé est un message d'erreur 
 * @example
 *  sendDiscordMessage({ title: "Titre du webhook", text: "Text du webhook"})
 * @returns {void}
 */
const sendDiscordMessage = ({ title, text }, isError = true) => {
  const discordMessage = {
    content: isError ? `<@${process.env.DISCORD_ID}>` : "",
    avatar_url: "https://portail.henallux.be/favicon-96x96.png",
    username: "IESN Scheduler",
    embeds: [
      {
        timestamp: new Date(),
        color: isError ? getSettingByKey("RED_COLOR") : getSettingByKey("GREEN_COLOR"),
        fields: [
          {
            name: title,
            value: text,
          },
        ],
      },
    ],
  };

  axios.post(process.env.DISCORD_WEBHOOK_URL, JSON.stringify(discordMessage), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Retourne les cours "applatis" et formatés de la section donnée
 * @param {string} [section=IG] Section (ex: "IG", "MK")
 * @returns {Object}
 * @example
 *  getFormatedCourses("IG");
 * // return:
 * {
 *  "1": [{
      id: "",
      displayName: "",
      completeName: "",
      aliases: [""] | null
    },
    { 
      id: "",
      displayName: "",
      completeName: "",
      aliases: [""] | null
    }],
 *  "2": [...],
 *  "3": [...]
 * }
 */
const getFormatedCourses = (section = "IG") => {
  let formatedCourses = {
    1: [],
    2: [],
    3: []
  };
  const sectionData = getSectionDataBySection(section);
  const mapFormatCourse = ({displayName, completeName, id, aliases}) => {
    return {
      displayName,
      completeName,
      id,
      aliases
    }
  };
  
  for(let i = 1; i <= 3; i++){
    if(sectionData[i].classes.length > 0){
      formatedCourses[i] = sectionData[i].classes.reduce((accumulator, { classes: currentClasseClasses, id: currentClasseId, displayName: currentClasseDisplayName, completeName: currentClasseCompleteName, aliases: currentClasseAliases }) => {
        if(currentClasseClasses){
          accumulator = [...accumulator, ...currentClasseClasses.map(mapFormatCourse)]
        }else{
          accumulator = [...accumulator, {
            displayName: currentClasseDisplayName,
            completeName: currentClasseCompleteName,
            id: currentClasseId,
            aliases: currentClasseAliases
          }]
        }
        return accumulator;
      }, [])
    }
  }

  return formatedCourses;
}

/**
 * Retourne tous les labels (avec les alias) présents dans la database
 * @param {string} [section=IG] Section (ex: "IG", "MK")
 * @returns {string[]}
 */
const getAllCoursesLabels = (section = "IG") => {
  const formatedCourses = getFormatedCourses(section);
  const arrayFormatedCourses = [...formatedCourses[1], ...formatedCourses[2], ...formatedCourses[3]]
  return [...arrayFormatedCourses.map(course => course.displayName), ...arrayFormatedCourses.filter(course => course.aliases).reduce((acc, curr) => [...acc, ...curr.aliases], [])]
}

/**
 * Retourne les informations du bloc formatées pour Vue.JS pour plus de détails voir {@link formatSectionDataForVue}
 * @param {string|number} blocNumber 
 * @param {string} [section=IG] 
 */

const formatBlocDataForVue = (blocNumber, section = "IG") => {
  let finalArray = [];
  const classesData = getClassesBySectionAndBloc(blocNumber, section);

  if(classesData){
    const ueWithClasses = classesData.filter(classe => classe.classes);
    const ueWithoutClasses = classesData.filter(classe => !classe.classes);

    const mapClasseForVue = (classe) => {
      return {
        text: classe.displayName,
        value: classe.id
      }
    }
    
    finalArray = [ ...ueWithoutClasses.map(mapClasseForVue), ...ueWithClasses.reduce((accumulator, currentClasse) => [ ...accumulator, { header: currentClasse.displayName }, ...currentClasse.classes.map(mapClasseForVue)], [])]
  }
  return finalArray
}

/**
 * Retourne les informations de la section formatées pour Vue.JS
 * @param {string} [section=IG] 
 * @example
 *  formatSectionDataForVue("IG");
 *  // return
 *  {
 *    bloc1: {
 *      groups: [{text: "Groupe A", value: "A"}, ...],
 *      classes: [{header: "Titre de l'UE"}, {text: "Organisation et exploitation des données", value: "OED"}, ...]
 *    },
 *    bloc2 : {
 *      groups: [...],
 *      classes: [...]
 *    },
 *    bloc3 : {
 *      groups: [...],
 *      classes: [...]
 *    }
 *  }
 */
const formatSectionDataForVue = (section = "IG") => {
  let formatedSectionData = {}
  for(let blocNumber = 1; blocNumber <= 3; blocNumber ++){
    formatedSectionData["bloc" + blocNumber] = {
        groups: [],
        classes: []
    }
    formatedSectionData["bloc" + blocNumber].classes = formatBlocDataForVue(blocNumber, section);
    if(formatedSectionData["bloc" + blocNumber].classes.length > 0){
      const blocGroups = getGroupsBySectionAndBloc(blocNumber, section);
      formatedSectionData["bloc" + blocNumber].groups = blocGroups.reduce((accumulator, currentGroupLetter) => [...accumulator, { text: "Groupe " + currentGroupLetter, value: `${blocNumber + currentGroupLetter}`}], [])
    }
  }

  return formatedSectionData;
}


module.exports = {
  sendDiscordMessage,
  objectsAreEquals,
  getFormatedCourses,
  getAllCoursesLabels,
  formatSectionDataForVue
};
