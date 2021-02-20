/**
 * Toutes les méthodes utilisées pour la génération du calendrier personnalisé
 * @module calendar
 */

const { getFormatedCourses } = require("./utils");

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
 * @param {string[]|null} coursesFollowed 
 * @param {string|number} blocNumber 
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
 * @param {string[]|string|null} coursesBloc1
 * @param {string[]|string|null} coursesBloc2
 * @param {string[]|string|null} coursesBloc3
 * @param {boolean} isInBloc1 
 * @param {boolean} isInBloc2 
 * @param {boolean} isInBloc3 
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
}

module.exports = {
    isBlocAffiliate,
    determineBlocs,
    getFollowedCourses
  };
  