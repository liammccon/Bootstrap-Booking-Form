function verifyInputs() {
  //Add all input elements to the input array
  let inputs = buildInputArray();
  inputs.push($("#number-of-adults")); //Add the dropdown
  let isValidForm = true;

  for (const i of inputs) {
    if (hasVal(i)) {
      setValid(i);
    } else {
      setInvalid(i);
      isValidForm = false;
      const inputName = getInputName(i);
      toastr.error("Please enter the " + inputName + " field!");

    }
  }
  const validCheckIn = verifyCheckIn();
  const validCheckOut = verifyCheckOut();
  if (!validCheckIn || !validCheckOut) {
    isValidForm = false;
  }
  
  if (isValidForm) {
    toastr.success("Form submitted!");
  }
}

function setValid(elements) {
  elements.removeClass("is-invalid").addClass("is-valid");
}
function setInvalid(element) {
  element.removeClass("is-valid").addClass("is-invalid");
}

//Clear button - removes values and validity colors
function clearAllInputs() {
  let inputs = buildInputArray();
  inputs.push($("#number-of-adults"));
  inputs.forEach((i) => {
    i.val("");
    i.removeClass("is-invalid").removeClass("is-valid");
  });
  //Handle special inputs
  $("#number-of-adults").val("-1").prop("selected", true);
  $("[name=priority-radios]").removeAttr("checked");
  $("#priority-radio-low").prop("checked", true);
  $("#num-of-days").val("Displays num of days...");
  $("#cost").val("Displays cost...");
  $("#range-slider").val("5");
  toastr.clear();
  toastr.info("All fields cleared");
}

/**
  Returns an array of all input elements
*/
function buildInputArray() {
  let inputs = [];
  let inputIterator = $(".form-control");
  inputIterator.each(function () {
    inputs.push($(this));
  });
  //Remove the read only inputs
  inputs = inputs.filter((i) => !i.hasClass("ltm-read-only"));
  return inputs;
}

//Returns a string representation of the input element based on its ID
function getInputName(input){
  let name = input.attr("id");
  name = name.replaceAll("-", " ");
  return name;
}

function hasVal(input) {
  //Check for date
  if (input.attr("type") === "date") {
    let date = new Date(input.val());
    //returns whether a date has been entered
    return !isNaN(date.getDate());
  }
  //For dropdown
  else if (input.prop("tagName").toLowerCase() === "select") {
    return input.val() > 0; //Default is -1
  } else {
    //For standard input field
    return Boolean(input.val());
  }
}

//Remove invalid color when user adds input
$(".form-control").change(function(){
  $(this).removeClass("is-invalid");
});

$(document).ready(function () {
  //Toastr options
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toast-top-right",
    preventDuplicates: true,
    showDuration: "1000",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
  };
});

//--------------------------------------
//For Scheduling
//--------------------------------------

//Display cost and num of days
$(".ltm-schedule").change(function () {
  //remove value for cost if no adults selected
  const hasAdults = hasVal($("#number-of-adults"));
  if (!hasAdults) { //If no value for adults, remove cost
      $("#cost").val("Displays cost...");
  }
  //if check in is present & check out is after check in
  if (!checkInIsInPast() &
      !checkOutIsBeforeCheckIn()){
    //calculate days
    const days = checkOutMoment().diff(checkInMoment(), "days");
    $("#num-of-days").val(days);
    
    if (hasAdults){
        //Calculate and display cost
        const cost = 150 * days * $("#number-of-adults").val();
        $("#cost").val("$" + cost);
    } 
  } else { //reset days if dates are not valid
    $("#num-of-days").val("Displays num of days...");
  }
  
});




//On changing check in, alert user if it is in the past
$("#check-in").change(function () {
  verifyCheckIn();
  //If the check out has been filled
  if ((checkOutMoment())){
    //verify that check out is not before new check in 
    verifyCheckOut();
  }
});
function verifyCheckIn() {
  if (!checkInMoment()) {
    //If no date has been entered
    return false;
  } else if (checkInIsInPast()) {
    toastr.error("Check-in cannot be in the past!");
    setInvalid($("#check-in"));
    return false;
  } else {
    $("#check-in").removeClass("is-invalid");
    return true;
  }
}

//On changing check out, alert user if check out is not after check in
$("#check-out").change(function () {
  verifyCheckOut();
});
function verifyCheckOut() {
  if (!checkOutMoment()) {
    //If no date has been entered
    return false;
  } else if (checkOutIsBeforeCheckIn()) {
    toastr.error("Check out must be after check in!");
    setInvalid($("#check-out"));
    return false;
  } else {
    $("#check-out").removeClass("is-invalid");
    return true;
  }
}

//Returns the check in date as a moment.js 
function checkInMoment() {
  if ($("#check-in").val() == "") {
    return undefined;
  }
  return moment(new Date($("#check-in").val()));
}
//Returns the check out date as a moment.js 
function checkOutMoment() {
  if ($("#check-out").val() == "") {
    return undefined;
  }
  return moment(new Date($("#check-out").val()));
}


function checkInIsInPast() {
  let checkIn = checkInMoment();
  if (!checkInMoment()) return true;
  let yesterday = moment().add(-1, "days");
  let inPast = (date) => date <= yesterday;
  return inPast(checkIn);
}

function checkOutIsBeforeCheckIn() {
  return checkOutMoment() <= checkInMoment();
}

function datesFilledOut(){
  return hasVal($("#check-in")) && hasVal($("#check-out"));
}
