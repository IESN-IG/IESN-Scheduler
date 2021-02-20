/**
 * Toutes les méthodes intéragissant avec le portail
 * @module portail
 */
const axios = require("axios");
const { setCurrentCodes, getCurrentCodes } = require("./db.js");
const { objectsAreEquals, sendDiscordMessage } = require("./utils.js");
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
 * Cherche et retourne les codes correspondants aux groupes
 * @returns {Promise}
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
 * Mets à jour les codes correspondants aux groupes
 * @param {boolean} [onLoad=false] 
 * @returns {void}
 */
const updateClassesCodes = (onLoad = false) => {
    searchClassesCodes()
      .then((result) => {
        const currentCodes = getCurrentCodes();
        if (!objectsAreEquals(currentCodes, result)) {
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
 * Retourne l'instance d'axios avec l'identification au portail
 * @returns {Object}
 */
const getAxiosPortailInstance = () => axiosPortail;

module.exports = { updateClassesCodes, getAxiosPortailInstance };