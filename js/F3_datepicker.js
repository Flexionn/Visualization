$('#datePick').multiDatesPicker();



$('.get_dates').click(function() {
    var dates = $('#datePick').multiDatesPicker('getDates');
    console.log(dates);

    updateChart(extractDagComponent(dates));
});

function extractDagComponent(datumArray) {
    // Zorg ervoor dat datumArray een array is
    if (!Array.isArray(datumArray)) {
        throw new Error('datumArray moet een array zijn.');
    }

    // Map elke datum naar de dagcomponent (parsen naar integer om de voorloopnullen te verwijderen)
    return datumArray.map(function(datum) {
        return parseInt(datum.split("/")[1], 10);
    });
}