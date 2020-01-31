window.onload = init;

function init() {
    let momentLastFriday = getLastFridayOfMonth(moment(Date.now()));
    let divFridayAlert = document.getElementById("fridayAlert");
    if (momentLastFriday.startOf('day').isSame(moment(Date.now()).startOf('day'))) {
        divFridayAlert.classList.add('alert', 'alert-danger', 'text-center');
        fillDivFridayAlert(divFridayAlert);
    }
}

function getLastFridayOfMonth(moment) {
    let lastDay = moment.endOf('month').endOf('day');
    return lastDay.subtract((lastDay.day() + 2) % 7, 'days');
}

function fillDivFridayAlert(element) {
    let momentToday = moment(Date.now());
    let span = document.createElement('span');
    let strong = document.createElement('strong');
    strong.innerText = "Avertissement - Maintenance Henallux\n";

    let paragraph = document.createElement('p');
    paragraph.innerText = `Aujourd'hui, ${momentToday.format("dddd DD/MM")}, comme tous les derniers vendredis du mois, a lieu une maintenance du système informatique Henallux.\nLa génération de calendrier sera perturbée le temps de cette maintenance.`;

    span.appendChild(strong);
    span.appendChild(paragraph);

    element.appendChild(span);
}