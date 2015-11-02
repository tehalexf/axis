function encodeRFC5987ValueChars (str) {
    return encodeURIComponent(str).
        // Note that although RFC3986 reserves "!", RFC5987 does not,
        // so we do not need to escape it
        replace(/['()]/g, escape). // i.e., %27 %28 %29
        replace(/\*/g, '%2A').
            // The following are not required for percent-encoding per RFC5987, 
            // so we can allow for a little better readability over the wire: |`^
            replace(/%(?:7C|60|5E)/g, unescape);
}

function isNumeric(num){
    return !isNaN(num)
}

$(document).ready(function() {
  // set defaults
  $("#locationform").hide();
  $("#locationdropdown").val("computer");
  var dropdown = true;

  // dropdown changer
  $("#locationdropdown").change(function() {
    if ($("#locationdropdown").val() == "location") {
      dropdown = false;
      $("#locationform").show();
      $("#computerform").hide();
    } else {
      dropdown = true;
      $("#locationform").hide();
      $("#computerform").show();
    }
  });

  // form submission
  $("#submit").click(function(e) {
    //input validation
    var valid = 0;
    var query = "?name="
    // REALLY BAD INPUT VALIDATION
    if (!$("#name").val()) {
      $("#name").parent('div').addClass("has-error");
    } else {
      $("#name").parent('div').removeClass("has-error");
      valid++;
      query += encodeRFC5987ValueChars($("#name").val());
    }
    
    if (dropdown) {
      if (!$("#num").val() || isNumeric($("#num").val())) {
        $("#num").parent('div').addClass("has-error");
      } else {
        $("#num").parent('div').removeClass("has-error");
        valid++;
        query += "&num=" + encodeRFC5987ValueChars($("#num").val());
      }
    } else {
      if (!$("#location").val()) {
        $("#location").parent('div').addClass("has-error");
      } else {
        $("#location").parent('div').removeClass("has-error");
        valid++;
        query += "&loc=" + encodeRFC5987ValueChars($("#location").val());
      }
    }

    var format = /^[0-9]+[a-zA-Z]*[\s]*([\s,]+[0-9]+[a-zA-Z]*)*$/i;
    if (!$("#subject").val() &&  format.test( $("#subject").val() ) {
      $("#subject").parent('div').addClass("has-error");
    } else {
      $("#subject").parent('div').removeClass("has-error");
      valid++;
      query += "&loc=" + encodeRFC5987ValueChars($("#location").val());
    }
    if (!$("#password").val()) {
      $("#password").parent('div').addClass("has-error");
    } else {
      $("#password").parent('div').removeClass("has-error");
      valid++;
      query += "&pass=" + encodeRFC5987ValueChars($("#password").val());
    }


    if (valid == 4) {
      //do submit
      console.log("we good");
      console.log(query);
    } else {
      console.log("nice try");
    }

  });


  // row toggle
  $(".rowtoggle").click(function(e) {
    if ($(this).hasClass("success")) {
      $(this).addClass("danger").removeClass("success");
      //send to server BUSY
    } else {
      $(this).addClass("success").removeClass("danger");
      //send to server AVAILABLE
    }
  });

});