/*********************************************************************************
*  WEB422 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: ___Ruyuan Sun___ Student ID: _101836229__ Date: __May 31, 2023____
*
********************************************************************************/ 

// tripData (array). Populate it later with a "fetch" call 
let tripData = [];

// currentTrip (object). Populate it later once the user clicks on a specific trip 
let currentTrip = {};

// page (number). Current page
let page = 1;

// perPage (number). How many trip items on each page 
const perPage = 10;

// map (leaflet "map" object). Current map
let map = null;

// objectToTableRow (function as template)
let objectToTableRow = function(trip) {
    return `<tr data-id=${trip._id} class=${trip.usertype}>
        <td>${trip.bikeid}</td>
        <td>${trip['start station name']}</td>
        <td>${trip['end station name']}</td>
        <td>${(trip.tripduration / 60).toFixed(2)}</td>
    </tr>`;
};

// loadTripData (function)
let loadTripData = function () {
    let url = `https://graceful-gray-piranha.cyclic.app/api/trips?page=${page}&perPage=${perPage}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            tripData = data;
            let tableRowsString = tripData.map(trip => objectToTableRow(trip)).join('');
            document.querySelector('#trips-table tbody').innerHTML = tableRowsString;
            // add the "click" event listener to the newly created rows
            document.querySelectorAll('#trips-table tbody tr').forEach((row) => {
                row.addEventListener('click', (e) => { 
                    currentTrip = tripData.find((trip) => trip._id === row.getAttribute('data-id'));  //Finds the first element in an array that satisfies the condition and returns that element
                    document.querySelector('.modal-title').innerHTML = `Trip Details (Bike: ${currentTrip.bikeid})`;
                    document.querySelector('#map-details').innerHTML = `Start Location: ${currentTrip['start station name']}<br>End Location: ${currentTrip['end station name']}<br>Duration: ${(currentTrip.tripduration / 60).toFixed(2)}`;
                    
                    let modal = new bootstrap.Modal(document.getElementById("trip-modal"), {
                        backdrop: "static",
                        keyboard: false
                    });

                    modal.show();
                });
            });
            document.querySelector('#current-page').innerHTML = `${page}`;
        })
        .catch(error => {
            console.log("An error occurred:", error);
        });
};

// Execute when the DOM is 'ready'
document.addEventListener('DOMContentLoaded', function () { 
    loadTripData();
    document.querySelector('#previous-page').addEventListener('click', () => { 
        if (page > 1) {
            page--;
            loadTripData(); // Invoke the loadTripData function to refresh the table with the new page value
        }
    });
    document.querySelector('#next-page').addEventListener('click', () => { 
        page++;
        loadTripData();
    });
    document.querySelector("#trip-modal").addEventListener("shown.bs.modal", function () {
        map = new L.Map('leaflet', {
            layers: [
                new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            ]
        });
        
        let start = L.marker([currentTrip['start station location'].coordinates[1], currentTrip['start station location'].coordinates[0]])
        .bindTooltip(currentTrip['start station name'],
            {
                permanent: true,
                direction: 'right'
            }).addTo(map);
        
        let end = L.marker([currentTrip['end station location'].coordinates[1], currentTrip['end station location'].coordinates[0]])
        .bindTooltip(currentTrip['end station name'],
            {
                permanent: true,
                direction: 'right'
            }).addTo(map);
        
        var group = new L.featureGroup([start, end]);
        
        map.fitBounds(group.getBounds(), { padding: [60, 60] });   
    });
    document.querySelector("#trip-modal").addEventListener("hidden.bs.modal", function () {
        map.remove();
    });
});