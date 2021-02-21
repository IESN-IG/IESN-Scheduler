const { getSections } = require("../lib/db");
const { formatSectionDataForVue } = require("../lib/utils");

async function routes(fastify){
    fastify.get('/section/:section', (request, reply) => {
        const availableSections = getSections();
        let section = request.params.section?.toUpperCase();
        if(!section || !availableSections.includes(section)) section = "IG";
        reply.send(formatSectionDataForVue(section));
    });
}

module.exports = routes;