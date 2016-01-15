var socket = io.connect('http://d.rhocode.com:5000'); //SocketIO Connection

var tutorID = -1; //Local tracking of tutor numbers
var tuteeRoom = -1;
var tutorRoom = -1;
var dropdown = true;
var tdropdown = true;
var in_queue = false;
var queueing_for = -1;
var master_dict = {};

socket.on('tutor_table_resp', function(data) {
    console.log(data);
    var $data = $('<div>');
    var numitems = 0;
    $.each(data.data, function(i, item) {
        numitems++;
        var $tr = $('<tr id=\'' + item.tutorID + '\'>').append(
            $('<td>').text(item.name),
            $('<td>').text(item.location),
            $('<td>').text(item.subjects),
            $('<td>').text(item.status)
            );
        $data.append($tr);
    });
    if (numitems == 0)
        $data.append($.parseHTML('<tr><td>No tutors present.</td><td/><td/><td/></tr>'));
    $('#tutorbody').html($data.html());
});



socket.on('login_resp', function(data) {
    console.log(data);
    if (data['status'] == 'failed')
        $("#serverresponselogin").text("Sign-in failed.");
    else {
        tutorID = data.tutorcode;
        $("#serverresponselogin").html("Sign-in successful! Welcome " + $("#name").val() + '! Your tutor code is <b>' + data.tutorcode + '</b>.');
        socket.emit('tutor_table_req');
    }

});

function pcping() {
    $.ajax({
        url: "http://d.rhocode.com:5000/pinghost.html",
        data: {},
        type: "GET",
        crossDomain: true,
        dataType: "jsonp",
        success: function(data) {
            if (data.pc != '-1') {
                $("#locationformgroup").hide();
                $("#locationform").hide();
                $("#computerform").show();
                $("#num").val(data.pc);
                $("#num").prop('disabled', true);
            } else {
                $("#locationformgroup").hide();
                $("#locationform").show();
                $("#computerform").hide();
                dropdown = false;
            }


            if (data.pc != '-1') {
                $("#tlocationformgroup").hide();
                $("#tlocationform").hide();
                $("#tcomputerform").show();
                $("#tnum").val(data.pc);
                $("#tnum").prop('disabled', true);
            } else {
                $("#tlocationformgroup").hide();
                $("#tlocationform").show();
                $("#tcomputerform").hide();
                tdropdown = false;
            }


        },
        error: function(xhr, status) {},
        complete: function(xhr, status) {
            console.log("complete");
        }
    });
}



// socket.emit('login_req', {'name' : 'a', 'pass' : 'csrocks', 'location' : 'home', 'subjects' : '10'});


function createButton(id) {
    return '<button id="' + id + '" type="button" class="btn btn-xs btn-success enterqueue" \
    title="Enter Queue">\
    <span class="glyphicon glyphicon glyphicon-time" aria-hidden="true"></span>\
    </button>'
}

function encodeRFC5987ValueChars(str) {
    return str;
    // Taken out, possibly replace later.

    // return encodeURIComponent(str).
    //     // Note that although RFC3986 reserves "!", RFC5987 does not,
    //     // so we do not need to escape it
    // replace(/['()]/g, escape). // i.e., %27 %28 %29
    // replace(/\*/g, '%2A').
    //     // The following are not required for percent-encoding per RFC5987,
    //     // so we can allow for a little better readability over the wire: |`^
    // replace(/%(?:7C|60|5E)/g, unescape);
}

function isNumeric(num) {
    return !isNaN(num)
}


// function setupTutor(tid, name, location, subjects) {
//     socket.emit('tutor_setup', {'name' : name, 'location' : location, 'tid' : tid, 'subjects' : subjects})
//     $("#tuteesign").hide();
//     $("#tutorsign").hide();
// }


function updateCurrentTutors() {
    var string1 = "Current Tutors: ";
    var string2 = " for ";
    var string3 = string2.concat(String(queueing_for));
    if (master_dict.hasOwnProperty(parseInt(queueing_for)) && master_dict[parseInt(queueing_for)] != 0 )
        $('#queuestatus2').text(string1.concat(String(master_dict[parseInt(queueing_for)])).concat(string3));
    else
        $('#queuestatus2').text("No tutors avaliable for ".concat(String(queueing_for)).concat("."));
}

socket.on('tutor_has_no_tutees_resp', function(data) {
    console.log('Waiting for a tutee.')
        tutorRoom = data.data;
    $('#tutor_text_status').text('No tutees at this time. You\'ve joined room ' + data.data + '.');
});


socket.on('tutor_found_tutee_resp', function(data) {
    onsole.log('A tutee was found!');
    ('#tutor_text_status').text('Your tutee is ' + unescape(data['tuteeName']) + ' -- ' + unescape(data['tuteeLocation']));
    etTimeout(function() {
        $("#nextOrStart").removeClass('disabled');
    }, 1000);
});


socket.on('tutee_found_tutor_resp', function(data) {
    $('#tutorname').text(unescape(data['name']));
    $('#tutorlocation').text(unescape(data['location']));
    $('#loadingqueue').hide();
    $('#foundqueue').fadeIn();
    $('#exitqueue').text("Done");
    console.log(unescape(data['name']));
    console.log(data['location']);
    in_queue = false;
});


socket.on('tutee_queue_status', function(data) {
    $(queuestatus1).text(data.status);
    tuteeRoom = data.room;
    tuteeClass = data.myclass;

    updateCurrentTutors();
});


// function populateTuteeTable() {
//     $.ajax({
//         url: "http://d.rhocode.com:5001/tutoredsubjs.html?",
//         data: {},
//         type: "GET",
//         crossDomain: true,
//         dataType: "jsonp",
//         success: function(data) {
//             var $data = $('<div>');
//             var numitems = 0;
//             $.each(data.data, function(i, item) {
//                 numitems++;
//                 var $tr = $('<tr id=\'class-' + item.subject + '\'>').append(
//                     $('<td>').text(item.subject),
//                     $('<td>').text(item.queue),
//                     $('<td>').html($.parseHTML(createButton('enter-queue-' + item.subject)))
//                 );
//                 $data.append($tr);
//             });
//             if (numitems == 0)
//                 $data.append($.parseHTML('<tr><td>There are no tutored classes at this time.</td><td/><td/></tr>'));
//             $('#tutoringsubjectbody').html($data.html());
//         },
//         error: function(xhr, status) {

//         },
//         complete: function(xhr, status) {
//             console.log("Table populated.");
//         }
//     });
// }

socket.on('tutor_connected_resp', function(data) {
    console.log(data);
    console.log("Poop");
    if (data['status'] == 'success') {
        console.log('Tutor has been added.');
        $('#tutor-control-panel').fadeIn();
        $('#nextOrStart').text('Start Tutoring').removeClass('disabled');
        $('#tutor_text_status').text('You are connected!');
        socket.emit('subjects_broadcast_req');
    } else {
        console.log('Tutor could not be added.');
    }
});


socket.on('subjects_resp', function(data) {
    var $data = $('<div>');
    var numitems = 0;
    var temp_dict = {};
    $.each(data.data, function(i, item) {
        numitems++;
        temp_dict[item.subject] = item.tutors;
        var $tr = $('<tr id=\'class-' + item.subject + '\'>').append(
            $('<td>').text(item.subject),
            $('<td>').text(item.queue),
            $('<td>').html($.parseHTML(createButton('enter-queue-' + item.subject)))
        );
        $data.append($tr);
    });

    for (var key in temp_dict) {
        if (!master_dict.hasOwnProperty(key))
            master_dict[key] = temp_dict[key];
    }

    for (var key in master_dict) {
        if (temp_dict.hasOwnProperty(key))
            master_dict[key] = temp_dict[key];
        else
            master_dict[key] = 0;
    }

    if (in_queue) {
        updateCurrentTutors();
    }

    console.log("UPDATED DICT");
    console.log(master_dict);
    if (numitems == 0)
        $data.append($.parseHTML('<tr><td>There are no tutored classes at this time.</td><td/><td/></tr>'));
    $('#tutoringsubjectbody').html($data.html());
    console.log(data);

});






function enQueue(myclass, name, location) {
    n_queue = true;
    console.log(myclass.slice(12));
    queueing_for = myclass.slice(12);
    // var socket = io.connect('http://d.rhocode.com:5001');
    // socket.on('connect', function() {
    $('#foundqueue').hide();
    $('#loadingqueue').show();
    console.log('We waiting in queue now!');
    socket.emit('tutee_req', {
        'tuteeClass': myclass.slice(12), 'tuteeName': name, 'tuteeLocation' : location
    });


}

$(window).bind('beforeunload', function(){
    if( tutorID != -1 || in_queue ){
        return "You are leaving the tutoring page. If you are a tutor, your session will be destroyed. If you are waiting in queue, you will be removed."
    }
});




function submitSignIn() {
    //input validation
    var valid = 0;
    var query = "?name=";
    var name, location, pass, subjects;

    if (!$("#name").val()) {
        $("#name").parent('div').addClass("has-error");
    } else {
        $("#name").parent('div').removeClass("has-error");
        valid++;
        console.log(1);
        name = encodeRFC5987ValueChars($("#name").val());
    }

    if (dropdown) {
        if (!$("#num").val() || !isNumeric($("#num").val())) {
            $("#num").parent('div').addClass("has-error");
        } else {
            $("#num").parent('div').removeClass("has-error");
            valid++;
            location = encodeRFC5987ValueChars($("#num").val());
        }
    } else {
        if (!$("#location").val()) {
            $("#location").parent('div').addClass("has-error");
        } else {
            $("#location").parent('div').removeClass("has-error");
            valid++;
            location = encodeRFC5987ValueChars($("#location").val());
        }
    }

    var format = /^[0-9]+[a-zA-Z]*[\s]*([\s,]+[0-9]+[a-zA-Z]*)*$/i;
    if (!$("#subject").val() || !format.test($("#subject").val())) {
        $("#subject").parent('div').addClass("has-error");
    } else {
        $("#subject").parent('div').removeClass("has-error");
        valid++;
        subjects = encodeRFC5987ValueChars($("#subject").val());
    }
    if (!$("#password").val()) {
        $("#password").parent('div').addClass("has-error");
    } else {
        $("#password").parent('div').removeClass("has-error");
        valid++;
        pass = encodeRFC5987ValueChars($("#password").val());
    }

    if (valid == 4) {
        //do submit
        socket.emit('login_req', {'name' : name, 'pass' : pass, 'location' : location, 'subjects' : subjects});

    } else {
        console.log("Login failure.");
    }

}

$(document).ready(function() {
    // set defaults
    $('[data-toggle="tooltip"]').tooltip();
    sleep.prevent();
    $("#locationform").hide();
    $("#locationdropdown").val("computer");
    $("#tlocationform").hide();
    $("#tlocationdropdown").val("tcomputer");

    $("#nextOrStart").bind("click", function() {
        if ($(this).hasClass('disabled'))
            return;
        $('#tutor_text_status').text('Looking for someone to tutor...');
        $("#nextOrStart").text('Next Person').addClass('disabled');
        console.log("Looking for person to tutor");
        socket.emit('tutor_ready_req');
    });

    $("#exitqueue").bind( "click", function() {
        $('#exitqueue').text("Cancel Queue");
        if (tuteeRoom != -1) {
            // socket.emit('force_tutee_remove', {'myclass' : tuteeClass, 'tuteeID' : tuteeID});
            socket.emit('force_tutee_remove_req', {'room' : tuteeRoom, 'myclass' : tuteeClass});
            console.log("Removed tutee");
            tuteeRoom = -1;
        }
    });

    $("#disconnect").bind( "click", function() {
        if (tutorID != -1) {
            console.log('tutorID');
            if (tutorRoom != -1)
                socket.emit('force_tutor_remove_req', {'tutorRoom' : tutorRoom});
            socket.emit('remove_tutorinfo_req');
            tutorRoom = -1;
            tutorID = -1;
            $('#tutor-control-panel').fadeOut();
            $("#tuteesign").show();
            $("#tutorsign").show();
            console.log('disconnected');
        }
    });



    // dropdown changer

    $('#refreshtable').click(function() {
        //Just for appearences
        $('#refreshicon').addClass('fa-spin-custom');
        var button = $(this);
        button.prop('disabled', true).css('cursor', 'default');
        // populateTable();
        setTimeout(function() {
            button.prop('disabled', false);
            $('#refreshicon').removeClass('fa-spin-custom');
        }, 3000);
    });

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

    $("#tlocationdropdown").change(function() {
        if ($("#tlocationdropdown").val() == "tlocation") {
            tdropdown = false;
            $("#tlocationform").show();
            $("#tcomputerform").hide();
        } else {
            tdropdown = true;
            $("#tlocationform").hide();
            $("#tcomputerform").show();
        }
    });



    $(document).on('click', '.enterqueue', function(e) {
        var tr_id = $(this).attr('id');
        var valid = 0; // counts # of form arguments
        var name, location;
        if (!$("#tname").val()) {
            $("#tname").parent('div').addClass("has-error");
        } else {
            $("#tname").parent('div').removeClass("has-error");
            valid++;
            name = encodeRFC5987ValueChars($("#tname").val());
        }

        if (tdropdown) {
            if (!$("#tnum").val() || !isNumeric($("#tnum").val())) {
                $("#tnum").parent('div').addClass("has-error");
            } else {
                $("#tnum").parent('div').removeClass("has-error");
                valid++;
                location = encodeRFC5987ValueChars($("#tnum").val());
            }
        } else {
            if (!$("#tlocation").val()) {
                $("#tlocation").parent('div').addClass("has-error");
            } else {
                $("#tlocation").parent('div').removeClass("has-error");
                valid++;
                location = encodeRFC5987ValueChars($("#tlocation").val());
            }
        }

        console.log("HEJEJND");
        if (valid != 2)
            return;
        console.log("HEJEdJND");
        $('#signup').modal('hide');
        $('#signin').modal('hide');
        $('#queue').modal('show');

        enQueue(tr_id, name, location);
    });


    $('#queue').modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    })

    // // form submission
    // $("#ttsignup").click(function(e) {
    //     populateTuteeTable();
    // });

    $("#submit").click(function(e) {
        submitSignIn(dropdown);
    });

    $('#signin').keypress(function(e) {
        if (e.keyCode == 13) {
            submitSignIn();
        }
    });

    // // row toggle
    // $(".rowtoggle").click(function(e) {
    //     if ($(this).hasClass("success")) {
    //         $(this).addClass("danger").removeClass("success");
    //         //send to server BUSY
    //     } else {
    //         $(this).addClass("success").removeClass("danger");
    //         //send to server AVAILABLE
    //     }
    // });
    pcping();
    socket.emit('tutor_table_single_req');
    socket.emit('subjects_req');
    console.log("REQUESTED SUBS");

    var buttons = document.getElementsByClassName("disabled-at-start");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false;
    }
});
