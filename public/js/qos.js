const selectTimeStartMonth = document.querySelector('#selectTimeStartMonth');
const selectTimeStartDay = document.querySelector('#selectTimeStartDay');
const selectTimeStartYear = document.querySelector('#selectTimeStartYear');
const selectTimeEndMonth = document.querySelector('#selectTimeEndMonth');
const selectTimeEndDay = document.querySelector('#selectTimeEndDay');
const selectTimeEndYear = document.querySelector('#selectTimeEndYear');
const domain = document.querySelector('#domain');
const cdrsubmit = document.querySelector('#cdrsubmit');


var ns_access = "";

window.onload = function() {
    fetch('https://crexendo-core-021-las.cls.iaas.run/ns-api/oauth2/token/?grant_type=password&client_id=archertest&client_secret=90056b1f11f8c87fff30fd1b5acafd04&username=anicholson@crexendo.com&password=Crexendo2022!', {
        method: "POST"
    })
    .then((response) => response.json())
    .then((response) => {
        if (response.access_token) {
            ns_access = response.access_token;
            console.log('Server Connection Successful');
        }
    })
    .catch((err) => {
        console.log(`Error received from Server: ${err}`);
    })
};

// New XML HTTP Request to pull CDR Information from Server
const dHTTP = new XMLHttpRequest;
// const qosHTTP = new XMLHttpRequest;

const dataXMLRequest = function (requestBody) {
    dHTTP.open("POST", "https://crexendo-ndp-021-las.cls.iaas.run/ns-api/?object=cdr2&action=read");
    dHTTP.setRequestHeader("Authorization", `Bearer ${ns_access}`);
    dHTTP.send(requestBody);
}

dHTTP.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(dHTTP.responseXML);
        let serverResponse = dHTTP.responseXML;
        parseCDR(serverResponse);
    } else {
        console.log('An error occurred when trying to find the CDR Information');
    }
};

// qosHTTP.onreadystatechange = function() { 
//     if (this.readyState == 4 && this.status == 200) {
//         console.log(qosHTTP.responseXML);
//     // } else {
//         // console.log('The QOS Report could not be ran at this time.')
//     }
// }


const sendQosRequest = function(qosBody) {
    const qosHTTP = new XMLHttpRequest;
    qosHTTP.open("POST", "https://crexendo-ndp-021-las.cls.iaas.run/ns-api/?object=cdr2&action=read&qos=yes");
    qosHTTP.setRequestHeader("Authorization", `Bearer ${ns_access}`);
    qosHTTP.send(qosBody);
    qosHTTP.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(qosHTTP.responseXML);
        // } else {
            // console.log('The QOS Report could not be ran at this time.')
        }
    }
}

var qosQueue = [];

const parseCDR = function(responseXML) {
    // responseXML = responseXML;
    console.log("parseCDR() is now showing responseXML as " + responseXML.firstChild.textContent);
    let callIdList = responseXML.firstChild.getElementsByTagName('cdr_id');
    console.log(`callIdList is ${callIdList[0].textContent}`);

    let startMonth = selectTimeStartMonth.value.trim();
    let startDay = selectTimeStartDay.value.trim();
    let startYear = selectTimeStartYear.value.trim();
    let endMonth = selectTimeEndMonth.value.trim();
    let endDay = selectTimeEndDay.value.trim();
    let endYear = selectTimeEndYear.value.trim();
    let domainInput = domain.value.trim();

        for (i=0; i < callIdList.length; i++) {
                let qosBody = `
                {
                    "start_date": "${startYear}-${startMonth}-${startDay}",
                    "end_date": "${endYear}-${endMonth}-${endDay}",
                    "domain": "${domainInput}",
                    "id": "${callIdList[i].textContent}"
                }
                `;
    
                console.log(`parseCDR() parsed the qosBody parameter as ${qosBody}`);
                // setTimeout(sendQosRequest(qosBody), 1000); Removed for speed and have found better arrangement for the new XMLHttpRequest's
                sendQosRequest(qosBody);
        }
}


const runReport = function() {
    let startMonth = selectTimeStartMonth.value.trim();
    let startDay = selectTimeStartDay.value.trim();
    let startYear = selectTimeStartYear.value.trim();
    let endMonth = selectTimeEndMonth.value.trim();
    let endDay = selectTimeEndDay.value.trim();
    let endYear = selectTimeEndYear.value.trim();
    let domainInput = domain.value.trim();

    var cdrRequestBody = `
    {
        "start_date": "${startYear}-${startMonth}-${startDay} 00:00:00",
        "end_date": "${endYear}-${endMonth}-${endDay} 23:59:59",
        "domain": "${domainInput}",
        "limit": "1000"
    }
    `;

    dataXMLRequest(cdrRequestBody);
}




cdrsubmit.addEventListener("click", (e) => {
    e.preventDefault();
    runReport();
})