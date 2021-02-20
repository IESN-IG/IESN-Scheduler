const ical = require("ical-generator");
const { getCurrentCodes, getValidBlocsAndGroupsBySection } = require("../lib/db.js");
const { determineBlocs, getFollowedCourses, filterCalendar } = require("../lib/calendar.js");
const { getAxiosPortailInstance, updateClassesCodes } = require("../lib/portail.js");
const { sendDiscordMessage, getFormatedCourses, getAllCoursesLabels } = require("../lib/utils.js");

const patternDate = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/;
const patternTitle = /Matière : ([a-zA-Z0-9-'ÉéèÈà_!:.\/ ()]*)/;

async function routes(fastify){
    fastify.get('/calendar', async (request, reply) => {


        const validGroups = getValidBlocsAndGroupsBySection(); // Tous les groupes valides pour la section (ex: IG : 1a, 1b..., 2a, 2b, 3a, 3b);
        const requestedGroups = request.query["grp[]"] === undefined || Array.isArray(request.query["grp[]"]) ? request.query["grp[]"] : [request.query["grp[]"]]; // Les groupes indiqués dans la requête
        
        if(requestedGroups && requestedGroups.every(requestedGroup => validGroups.includes(requestedGroup))){
            const [isBloc1, isBloc2, isBloc3] = determineBlocs(requestedGroups); // Détermine les blocs de l'étudiant
            let courses = getFollowedCourses(request.query["crs1[]"], request.query["crs2[]"], request.query["crs3[]"], ...[isBloc1, isBloc2, isBloc3]); // Récupère les cours que l'étudiant veut suivre
            let coreCourses = new Set(); // Contiendra les cours communs / déjà rencontrés pour ne pas avoir de doublons dans l'horaire

            const calendar = ical({name: "Cours - IESN Scheduler", timezone: "Europe/Brussels" }); // Initialisation du calendrier
            const currentCodes = getCurrentCodes(); // Codes API actuels
            const formatedParams = `[${requestedGroups.map(group => `%22${currentCodes[group]}%22`).join(', ')}]`; // formate les codes dans le format requis pour l'API
            const axiosInstance = getAxiosPortailInstance();

            axiosInstance.get(`plannings/promotion/${formatedParams}`, {
                transformResponse: [function (data) {
                    const jsonData = JSON.parse(data);
                    const formatedCourses = getFormatedCourses();
                    const coursesLabels = getAllCoursesLabels();
                    return jsonData.filter(course => filterCalendar(course, courses, coreCourses, formatedCourses, coursesLabels));
                }]
            })
            .then(response => {
                for (let course of response.data) {
                    if (course.start && course.end) {
                        calendar.createEvent({
                            start: new Date(course.start.replace(patternDate, "$1-$2-$3T$4:$5:$6")),
                            end: new Date(course.end.replace(patternDate, "$1-$2-$3T$4:$5:$6")),
                            location: course.location,
                            summary: course.details.replace(patternTitle, "$1"),
                            description: course.details
                        });
                    }
                }
                reply.headers({
                    'Content-Type': 'text/calendar; charset=utf-8',
                    'Content-Disposition': `attachment; filename="iesnscheduler-${requestedGroups.join("_")}.ics"`
                });
                reply.send(calendar.toString());
            })
            .catch(err => {
                const message = `**Détails** : ${err}\n**FetchURLParams** : ${formatedParams}\n**Groupe** : ${requestedGroups.join(', ')}\n**Cours** :\nBloc 1 : ${request.query["crs1[]"]}\nBloc 2 : ${request.query["crs2[]"]}\nBloc 3 : ${request.query["crs3[]"]}`;
                sendDiscordMessage({title: "Erreur /calendar", text: message });
                updateClassesCodes();
            })
        }else{
            reply.redirect("/");
        }
    });
}

module.exports = routes;