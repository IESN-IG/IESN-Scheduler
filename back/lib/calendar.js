/**
 * Toutes les méthodes utilisées pour la génération du calendrier personnalisé
 * @module calendar
 */

const { getFormatedCourses } = require("./utils");
const patternTitle = /Matière : ([a-zA-Z0-9-'ÉéèÈà_!:.\/ ()]*)/;
const blocPattern = /\[(\d) IG [A-Z0-9]*]/;

/**
 * Vérifie si l'étudiant fait parti d'un bloc donné en fonction de ses groupes
 * @param {string[]} groups Groupes de l'étudiant
 * @param {string|number} blocNumber Numéro du bloc
 * @returns {boolean}
 */
const isBlocAffiliate = (groups, blocNumber) => groups.some(group => group.substring(0, 1) === blocNumber + "");

/**
 * Détermine les blocs dans lequel l'étudiant est inscrit
 * @param {string[]} groups Groupes de l'étudiant
 * @returns {boolean[]} 
 * @example
 *  determineBlocs(["1A", "2A"]); // [true, true, false]
 */
const determineBlocs = (groups) => [isBlocAffiliate(groups, 1), isBlocAffiliate(groups, 2), isBlocAffiliate(groups, 3)];

/**
 * Retourne les cours suivis par l'étudiant selon le bloc donné et la liste des cours (par défaut tous les cours sont suivis)
 * @param {string[]|null} coursesFollowed Cours sélectionnés par l'étudiant
 * @param {string|number} blocNumber Numéro du bloc
 * @returns {string[]} Codes des cours suivis dans le bloc donné
 */
const getFollowedCoursesByBloc = (coursesFollowed, blocNumber) => {
    // On pourrait imaginer déduire le numéro du bloc ici sauf que certains id de cours par exemple NPWF3 / NPCI3 ne sont pas du format des cours "standards" qui commencent par le numéro du bloc
    let courses = [];
    if (!coursesFollowed || coursesFollowed.includes("all")) {
        const formatedCourses = getFormatedCourses();
        courses = formatedCourses[blocNumber].map(course => course.id);
    } else {
        courses = coursesFollowed;
    }
    return courses;
}

/**
 * Retourne tous les cours suivis par l'étudiant
 * @param {string[]|string|null} coursesBloc1 Cours sélectionnés pour le bloc 1
 * @param {string[]|string|null} coursesBloc2 Cours sélectionnés pour le bloc 2
 * @param {string[]|string|null} coursesBloc3 Cours sélectionnés pour le bloc 3
 * @param {boolean} isInBloc1 L'étudiant est-il dans le bloc 1 ?
 * @param {boolean} isInBloc2 L'étudiant est-il dans le bloc 2 ?
 * @param {boolean} isInBloc3 L'étudiant est-il dans le bloc 3 ?
 * @returns {string[]} Codes des cours suivis
 */
const getFollowedCourses = (coursesBloc1, coursesBloc2, coursesBloc3, isInBloc1, isInBloc2, isInBloc3) => {
    // Être sûr de traiter un tableau ou undefined
    const cCoursesBloc1 = coursesBloc1 === undefined || Array.isArray(coursesBloc1) ? coursesBloc1 : [coursesBloc1];
    const cCoursesBloc2 = coursesBloc2 === undefined || Array.isArray(coursesBloc2) ? coursesBloc2 : [coursesBloc2];
    const cCoursesBloc3 = coursesBloc3 === undefined || Array.isArray(coursesBloc3) ? coursesBloc3 : [coursesBloc3];

    let followedCourses = [];

    if(isInBloc1)
        followedCourses = [...followedCourses, getFollowedCoursesByBloc(cCoursesBloc1, 1)];
    if(isInBloc2)
        followedCourses = [...followedCourses, getFollowedCoursesByBloc(cCoursesBloc2, 2)];
    if(isInBloc3)
        followedCourses = [...followedCourses, getFollowedCoursesByBloc(cCoursesBloc3, 3)];

    return followedCourses;
}

/**
 * Détermine si le cours doit être ajouté dans le calendrier ou non
 * @param {Object} course Cours actuel de la réponse API
 * @param {string[]} followedCourses Cours suivis par l'étudiant
 * @param {Set} commonCourses Cours communs déjà ajoutés dans l'horaire
 * @param {Object} formatedCourses Cours applatis et formatés
 * @param {Object} coursesLabels Labels de tous les cours
 * @returns {boolean}
 */
const filterCalendar = (course, followedCourses, commonCourses, formatedCourses, coursesLabels) => {
    const transformedString = `${course.start}/${course.end}/${course.location}/${course.title}`; // On crée une chaîne unique

    const isCoreCourse = commonCourses.has(transformedString); // On regarde si notre Set a déjà cette chaine (=> cours qui a déjà été mis dans le calendrier)

    if(isCoreCourse) return false; // Si le cours est déjà présent on ne va pas plus loin -> on ne l'ajoute pas

    commonCourses.add(transformedString);

    const isCourse = patternTitle.test(course.details) && coursesLabels.some(lbl => lbl === course.details.match(patternTitle)[1].replace(" (ex)", "").replace(" (th)", "")); // Si les détails correspondent au pattern (Matière : xxxx) et que le titre est dans tous les labels connus
    let addThisCourse = !isCourse; // Si c'est un cours connu alors on ne l'ajoute pas de suite (il peut ne pas être voulu par l'étudiant)

    if(isCourse){
        const label = course.details.match(patternTitle)[1].replace(" (ex)", "").replace(" (th)", "");
        const bloc = parseInt(course.text.match(blocPattern)[1]);
        const foundCourse = formatedCourses[bloc].find(classe => classe.displayName === label || classe.aliases?.includes(label));

        // Si on ne le trouve pas -> on l'ajoute par défaut pour ne pas pénaliser un étudiant et qu'il loupe son cours
        // Si on le trouve -> on vérifie que l'étudiant le suit
        addThisCourse = !foundCourse || followedCourses.some(c => c === foundCourse.id); 
    }

    return addThisCourse && !isCoreCourse; // On check si le cours doit être ajouté et qu'il n'a pas déjà été ajouté
}

module.exports = {
    isBlocAffiliate,
    determineBlocs,
    getFollowedCoursesByBloc,
    getFollowedCourses,
    filterCalendar
  };
  