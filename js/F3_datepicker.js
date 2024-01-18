$('#datePick').multiDatesPicker({
    // dateFormat: "d M",
    maxDate: new Date(2022, 10, 30),
    minDate: new Date(2022, 10, 1)
});

$('.get_dates').click(function() {
    var dates = $('#datePick').multiDatesPicker('getDates');
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