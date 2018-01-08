   // Initialize Firebase
   var config = {
    apiKey: "AIzaSyA8ovOs3Yz3hteo5QoLC0m2jfFxGRwNtNk",
    authDomain: "train-97ebf.firebaseapp.com",
    databaseURL: "https://train-97ebf.firebaseio.com",
    projectId: "train-97ebf",
    storageBucket: "",
    messagingSenderId: "813702782936"
  };
  firebase.initializeApp(config)

  var database = firebase.database();

    // Live Time of The Day 

    var updateTime = function(){
      var now = moment().format('hh:mm');
      $('#currentTime').html(now);
    }
  
    $(document).ready(function(){
      updateTime();
      setInterval(updateTime, 1000);
  });
  
// GLOBAL VARIABLES
var trainName = "";
var destination = "";
var firstTrainTime = "";
var firstTrainTimeArray = [];
var frequency = "";
var frequencyArray = [];
var nextArrival = "";
var minutesAway = "";
var html = "";
var counter = 0;
var isOn = true;




// PUSHES DATA TO DATABASE ON SUBMIT
$("#submit-button").on("click", function(event) {
  event.preventDefault();

  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  frequency = $("#frequency").val().trim();
  firstTrainTime = $("#first-train").val().trim();

  database.ref().push({
  trainName: trainName,
  destination: destination,
  frequency: frequency,
  firstTrainTime: firstTrainTime,
  });

  $("#train-name").val('');
  $("#destination").val('');
  $("#frequency").val('');
  $("#first-train").val('');

  return false;
});



//UPDATES TABLE ON LOAD AND WHEN CHILD IS ADDED, UPDATES NEXT ARRIVAL AND MINUTES AWAY EVERY 10 SECONDS
database.ref().orderByChild('employeeRole').on("child_added", function(snapshot) {

	var html = $('<div class="row">')

	firstTrainTime = snapshot.val().firstTrainTime;
	firstTrainTimeArray.push(firstTrainTime);

	frequency = snapshot.val().frequency;
	frequencyArray.push(frequency);

	nextTrainTime(firstTrainTime, frequency);

	html.append('<div class="column">' + (snapshot.val().trainName) + '</div>');
	html.append('<div class="column">' + (snapshot.val().destination) + '</div>');
	html.append('<div class="column">' + (snapshot.val().frequency) + '</div>');
	html.append('<div class="column" id="next-arrival-' + counter + '">' + moment(nextArrival).format("hh:mm a") + '</div>');
	html.append('<div class="column last" id="minutes-away-' + counter + '">' + minutesAway + '</div>');
	$("#train-display").append(html);
	counter++;
	});


//CALLS UPDATE EVERY 5 SECONDS
setInterval(update, 5000);

//TAKES FIRST TRAIN TIME AND FREQUENCY AS ARGUMENTS TO PRODUCE NEXT ARRIVAL TIME AND MINUTES AWAY
function nextTrainTime(firstTrainTime, frequency) {

  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTrainTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");

  // Current Time
  var currentTime = moment();

  // Difference between the times
  var diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes");

  // Time apart (remainder) -- [minutes since last train]
  var tRemainder = diffTime % frequency;

  // Minute Until Train
  minutesAway = frequency - tRemainder;

  // Next Train
  nextArrival = moment().add(minutesAway, "minutes");
}

//UPDATES SCREEN WITH NEXT ARRIVAL TIME AND MINUTES AWAY FOR EACH TRAIN -- BASED ON LOCAL TIME
function update() {
  for (var i = 0; i < counter; i++) {
	nextTrainTime(firstTrainTimeArray[i], frequencyArray[i]);
	$('#next-arrival-' + i).html(moment(nextArrival).format("hh:mm a"));
	$('#minutes-away-' + i).html(minutesAway);      
	  };
};


