const axios = require("axios");
const { setCurrentCodes, getCurrentCodes, initDatabase, getSettingByKey } = require("./db.js");
require("dotenv").config();

const axiosPortail = axios.create({
  baseURL: "https://portail.henallux.be/api/",
  timeout: 15000,
  headers: {
    Authorization: "Bearer " + process.env.JWT_PORTAIL,
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36",
  },
});

/**
 * Compare les codes API passés en argument avec les codes API présents en mémoire
 * @method
 * @param {Object} newCodes - Nouveaux codes API fetchés
 * @returns {boolean} Les codes API ont changé, ou non
 */
const codesAreEquals = (newCodes) => {
  const currentCodes = getCurrentCodes();

  const newCodesKeys = Object.keys(newCodes);
  const currentCodesKeys = Object.keys(currentCodes);
  const newCodesValues = Object.values(newCodes);
  const currentCodesValues = Object.values(currentCodes);

  return (
    newCodesKeys.length === currentCodesKeys.length &&
    currentCodesValues.every((code) => newCodesValues.includes(code))
  );
};

/**
 * Cherche les codes correspondants aux groupes
 * @method
 * @returns {Promise} Promise contenant les codes
 */
const searchClassesCodes = () => {
  return new Promise(async (resolve, reject) => {
    let jsonData = {};
    try {
      const blocsID = await axiosPortail.get(
        "classes/orientation_and_implantation/6/1",
        {
          transformResponse: [
            function (data) {
              let jsonData = JSON.parse(data);
              return jsonData.data.map((item) => item.id);
            },
          ],
        }
      );

      for (const bloc of blocsID.data) {
        const classesID = await axiosPortail.get(
          `classes/classe_and_orientation_and_implantation/${bloc}/6/1`,
          {
            transformResponse: [
              function (data) {
                let jsonData = JSON.parse(data);
                return jsonData.data.filter((grp) => grp.classe !== null);
              },
            ],
          }
        );
        for (const classe of classesID.data) {
          const formatedID = classe.annee.charAt(0) + classe.classe;
          jsonData[formatedID] = classe.id;
        }
      }
      resolve(jsonData);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Contenu du message Discord
 * @typedef {Object} ContenuDiscord
 * @property {string} title
 * @property {string} text
 */
/**
 * Envoie un webhook Discord
 * @method
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
 * Mets à jour les codes correspondants aux groupes
 * @method
 * @param {boolean} [onLoad=false] 
 * @returns {void}
 */
const updateClassesCodes = (onLoad = false) => {
  searchClassesCodes()
    .then((result) => {
      if (!codesAreEquals(result)) {
        setCurrentCodes(result);
        sendDiscordMessage(
          {
            title: "Information",
            text: onLoad ? "Codes mis en cache" : "Code mis à jour",
          },
          false
        );
      }
    })
    .catch((error) => {
      sendDiscordMessage(
        {
          title: "Erreur cache des codes-cours",
          text: `**Détails** : ${error.message}`,
        },
        false
      );
    });
};

/**
 * Charge les informations pour la première fois
 * @method
 * @returns {void}
 */
const load = () => {
    initDatabase();
    updateClassesCodes(true);
};

module.exports = {
  sendDiscordMessage,
  load
};
