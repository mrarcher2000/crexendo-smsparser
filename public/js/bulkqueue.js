const domain = document.querySelector("#domain");
const description = document.querySelector("#name");
const extension = document.querySelector("#extension");
const department = document.querySelector("#department");
const site = document.querySelector("#site");
const huntgroup_option = document.querySelector("#huntgroupSelect");
const wait_limit = document.querySelector("#maxWait");
const length_limit = document.querySelector("#maxLength");
const removeOnPark = document.querySelector("#additionalForm-NoPark");
const sring_1st = document.querySelector("#firstAgent");
const sring_inc = document.querySelector("#nextAgent");
const forwardUnansweredOption = document.querySelector("#unansweredSelect");
const forwardUnansweredDestination = document.querySelector("#forwardDestination");
var loginFormModal = new bootstrap.Modal(document.querySelector('#modalLoginForm'));
// const max_time = document.querySelector("#ringTimeout").value;
var ns_access = "";



window.onload = function () {
    loginFormModal.show();
  loginFormSubmit.focus();
  loginFormPassword.focus();

  loginFormSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    
  const response = fetch(`https://crexendo-core-021-las.cls.iaas.run/ns-api/oauth2/token/?grant_type=password&client_id=archertest&client_secret=90056b1f11f8c87fff30fd1b5acafd04&username=${loginFormUser.value}&password=${loginFormPassword.value}`, {
    method: "POST",
  })
  .then((response) => response.json())
  .then((response) => {
    if (response.access_token) {
      ns_access = response.access_token;
      console.log('Access Token Received from Netsapiens Server');
      loginFormModal.hide();
    } else {
      let incorrectLoginFunc = function() {
        alert('Incorrect Username or Password! Please try again');
        window.location.reload();
      };
      setTimeout(incorrectLoginFunc(), 5000);
    }
  })
  .catch(function() {
    alert('Incorrect Username or Password!');
  });
  });
}


/* Begin API Calls for Call Queues 
ORDER:
    1 - Create Call Queue
    2 - Create System User
    3 - Create Dial Translation
    4 - Create Answering Rule
    5 - Voicemail Dial Translation (if requested)
*/

var createQueueBody = {}


function createQueue () {

    let createQueueBody = {
        "domain": domain.value,
        "queue": extension.value,
        "description": description.value,
        "department": department.value,
        "site": site.value,
        "huntgroup_option": huntgroup_option.value,
        "wait_limit": wait_limit.value,
        "length_limit": length_limit.value,
        "enable_sms": "0"
    }

    if (huntgroup_option.value == "SRingOrdered") {
        createQueueBody["sring_1st"] = sring_1st.value;
        createQueueBody["sring_inc"] = sring_inc.value;
    }

    if (document.querySelector("#checkRecord").checked) {
        createQueueBody["record"] = "yes";
    }

    if (document.querySelector("#checkStats").checked) {
        createQueueBody["run_stats"] = "yes";
    }

    if (document.querySelector("#agentRequired").checked) {
        createQueueBody["agent_required"] = "yes";
    }

    if (document.querySelector("#introMOHRequired").checked) {
        createQueueBody["queue_options"] = "WaitMoh00";
    }

    if (document.querySelector("#allowCallback").checked) {
        createQueueBody["callback_max_hours"] = "2";
    }

    if (document.querySelector("#logoutAgent").checked) {
        createQueueBody["auto_logout"] = "no";
    }


    console.log(createQueueBody);
    var response = fetch("https://api.crexendovip.com/ns-api/?format=json&object=callqueue&action=create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ns_access}`
        },
        body: JSON.stringify(createQueueBody)
    })
    // .then((response) => response.json())
    .then((response) => {
        console.log(response.status);
        if (response.ok) {
            createSystemUser();
        } else {
            console.log(response.text);
        }
    })
}



function createSystemUser() {
    let createSubscriberBody = {
        "user": extension.value,
        "domain": domain.value,
        "first_name": description.value,
        "last_name": "",
        "passwordLength": "8",
        "subscriber_pin": `${Math.floor(1000 + Math.random() * 9000)}`,
        "dir_anc": "no",
        "dir_list": "no",
        "data_limit": "10000",
        "dial_plan": domain.value,
        "dial_policy": "US and Canada",
        "scope": "Basic User",
        "srv_code": "system-queue"
    }

    if (document.querySelector("#enableVoicemail").checked) {
        createSubscriberBody["vmail_provisioned"] = "yes",
        createSubscriberBody["vmail_enabled"] = "yes"
    }

    console.log(createSubscriberBody);


    var response = fetch('https://api.crexendovip.com/ns-api/?object=subscriber&action=create', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ns_access}`
        },
        body: JSON.stringify(createSubscriberBody)
    })
    // .then((response) => response.json())
    .then((response) => {
        console.log("Subscriber Creation Status: " + response.status);
        if (response.ok){
            createDialTranslation();
        } else {
            console.log("Error on Subscriber Build. " + response.text);
        }
    })
}



function createDialTranslation() {
    let dialTranslationBody = {
        "domain": domain.value,
        "dialplan": domain.value,
        "matchrule": `queue_${extension.value}`,
        "to_user": extension.value,
        "responder": "sip:start@call-queuing",
        "to_scheme": "sip:",
        "to_host": domain.value,
        "plan_description": `Portal Created: Call Queue - ${extension.value} (${description.value})`
    }


    console.log(dialTranslationBody);


    var response = fetch('https://api.crexendovip.com/ns-api/?object=dialrule&action=create', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ns_access}`
        },
        body: JSON.stringify(dialTranslationBody)
    })
    // .then((response) => response.json())
    .then((response) => {
        console.log("Dial Translation Created: " + response.status);
        if (response.ok) {
            createVoicemailTranslation();
        } else {
            console.log("Error on Queue Dial Translation\n" + response.text);
        }
    })
}



function createVoicemailTranslation() {
    if (document.querySelector("#enableVoicemail").checked) {
        var voicemailBody = {
            "domain": domain.value,
            "dialplan": domain.value,
            "matchrule": `vmail_${extension.value}`,
            "to_user": extension.value,
            "responder": "Residential Vmail",
            "to_scheme": "sip:",
            "to_host": domain.value,
            "plan_description": `Portal Created: Voicemail - ${extension.value} (${description.value})`
        }


        console.log(voicemailBody);

        var response = fetch('https://api.crexendovip.com/ns-api/?object=dialrule&action=create', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ns_access}`
            },
            body: JSON.stringify(voicemailBody)
        })
        // .then((response) => response.json())
        .then((response) => {
            console.log("Creating Voicemail DT\n" + response.status);
            if (response.ok) {
                createAnsweringRule();
            } else {
                console.log("Error on voicemail DT creation.\n" + response.text);
            }
        })
    } else {
        createAnsweringRule();
    }
}



function createAnsweringRule() {
    var answeringRuleBody = {
        "time_frame": "*",
        "enable": "1",
        "uid": `${extension.value}@${domain.value}`,
        "user": extension.value,
        "domain": domain.value,
        "for_control": "e",
        "for_parameters": `queue_${extension.value}`
    }

    if (forwardUnansweredOption.value = "forwardToDestination") {
        answeringRuleBody["fbu_control"] = "e";
        answeringRuleBody["fbu_parameters"] = forwardUnansweredDestination.value;
        answeringRuleBody["fna_control"] = "e";
        answeringRuleBody["fna_parameters"] = forwardUnansweredDestination.value;
    }

    if (enableVoicemail.checked) {
        answeringRuleBody["fbu_control"] = "e";
        answeringRuleBody["fbu_parameters"] = `vmail_${extension.value}`;
        answeringRuleBody["fna_control"] = "e";
        answeringRuleBody["fna_parameters"] = `vmail_${extension.value}`;
    }

    console.log(answeringRuleBody);

    var response = fetch('https://api.crexendovip.com/ns-api/?object=answerrule&action=create', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ns_access}`
        },
        body: JSON.stringify(answeringRuleBody)
    })
    // .then((response) => response.json())
    .then((response) => {
        console.log("Creating Answering Rules\n" + response.status);
        if (response.ok) {
            console.log("Call Queue Created! \n" + response.text);
        } else {
            console.log("Error on Answering Rule Creation\n" + response.text);
        }
    })
}



function validateQueue() {
    const errorMessage = document.querySelector("#errorMessage");

    errorMessage.style.display = "none";

    if (domain.value == "" || description.value == "") {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Missing Required Parameter(s)!</p>`
    }


    if (isNaN(extension.value) || extension.value >= 9000) {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Extension value must be numerical and between 100 - 8999!</p>`
    } else 

    if (isNaN(wait_limit.value) || wait_limit.value > 1000) {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Max Expected Wait value must be numerical and between 0 - 1000! Leave blank or 0 for Unlimited.</p>`
    } else 

    if (isNaN(length_limit.value) || length_limit.value > 99) {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Max Queue Length value must be numerical and between 0 - 99! Leave blank or 0 for Unlimited.</p>`
    } else

    if (isNaN(sring_1st.value)) {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Initial Agent to Ring value must be numerical!</p>`
    } else

    if (isNaN(sring_inc.value)) {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Agent Group to Add value must be numerical!</p>`
    } else

    if (isNaN(forwardUnansweredDestination.value)) {
        errorMessage.style.display = "inline";
        errorMessage.innerHTML = `<p style="color: red; font-size: 1.5rem;">Forward Destination value must be numerical! Please enter a 10-digit DID or User extension.</p>`
    } else {
        createQueue();
    }
    
}



document.querySelector("#huntgroupSelect").addEventListener("change", () => {
    console.log(`${huntgroup_option.value}`);
    if (huntgroup_option.value == "Call Park") {
        removeOnPark.style.display = "none";
    } else {
        removeOnPark.style.display = "inline";
    }

    if (huntgroup_option.value == "SRingOrdered") {
        document.querySelector("#orderedRingDiv").style.display = "inline";
    } else {
        document.querySelector("#orderedRingDiv").style.display = "none";
    }
});


document.querySelector("#unansweredSelect").addEventListener("change", ()=> {
    if (forwardUnansweredOption.value == "forwardToDestination") {
        document.querySelector("#forwardDestinationOptions").style.display = "inline";
    } else {
        document.querySelector("#forwardDestinationOptions").style.display = "none";
    }
    
});

document.querySelector("#enableVoicemail").addEventListener("change", () => {
    if (document.querySelector("#enableVoicemail").checked) {
        forwardUnansweredOption.value = "voicemail";
        forwardUnansweredOption.setAttribute('disabled', 'disabled');
    } else {
        forwardUnansweredOption.removeAttribute('disabled', 'disabled');
    }
})

document.querySelector("#allowCallback").addEventListener("change", () => {
    if (document.querySelector("#allowCallback").checked) {
        forwardUnansweredOption.value = "stayInQueue";
        forwardUnansweredOption.setAttribute('disabled', 'disabled');
    } else {
        forwardUnansweredOption.removeAttribute('disabled', 'disabled');
    }
})

document.querySelector('#submitQueue').addEventListener("click", (e) => {
    e.preventDefault();
    validateQueue();
});