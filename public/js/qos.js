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
        // debugger;
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
var qosData = [];
var callCounter = 0;
var callReportCount = 0;
var reportDownloadCounter = 0;

const generateCSV = function (qosData, callReportCount, reportDownloadCounter, callCounter) {
    console.log(qosData);
    console.log(callReportCount + ` is the callReportCount and the qosData length is ${qosData.length} and callCounter is ${callCounter}`);
    // console.log(callReportCount);
    // try {
    //     const parser = new Parser();
    //     const csvData = parser.parse(qosData);
    //     console.log(csv);
    // } catch (err) {
    //     console.log(err);
    // }

    // TEST QOSDATA WITHOUT THE [0]. IF NOT WORKING CHANGE BACK TO : var csvHeaders = Object.keys(qosData[0]).toString();
    if ((callReportCount) == qosData.length || qosData.length == 500) {
        var csvHeaders = Object.keys(qosData[0]).toString();
        console.log(csvHeaders);

        var csvData = qosData.map((item) => {
            return Object.values(item).toString();
        });

        var csv = [csvHeaders, ...csvData].join('\n');
        if (reportDownloadCounter == 0) {
            downloadCSV(csv);
        } else {
            console.log('Report has been downloaded');
        }
    }
    
}


const downloadCSV = function(csv) {
    reportDownloadCounter++;

    const csvBlob = new Blob([csv], { type: 'application/csv' });
    const url = URL.createObjectURL(csvBlob);
    var csvAnchor = document.createElement('a');
    csvAnchor.download = 'qos-report.csv';
    csvAnchor.href = url;
    csvAnchor.style.display = 'none';

    document.body.appendChild(csvAnchor);
    csvAnchor.click();
    csvAnchor.remove();
    URL.revokeObjectURL(url);
}

const sendQosRequest = function(qosBody) {
    const qosHTTP = new XMLHttpRequest;
    qosHTTP.open("POST", "https://crexendo-ndp-021-las.cls.iaas.run/ns-api/?object=cdr2&action=read&qos=yes");
    qosHTTP.setRequestHeader("Authorization", `Bearer ${ns_access}`);
    qosHTTP.send(qosBody);
    qosHTTP.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(qosHTTP.responseXML);
            let cdrDoc = qosHTTP.responseXML.firstChild;
            if (cdrDoc.childNodes[0].childNodes[22]) {     // testing change from if (cdrDoc.hasChildNodes('qos_orig')) { to if they have they have any child nodes
                let calldate = cdrDoc.childNodes[0].childNodes[22].childNodes[1].textContent;
                let duration = cdrDoc.childNodes[0].childNodes[22].childNodes[3].textContent;
                let aMosScore = cdrDoc.childNodes[0].childNodes[22].childNodes[5].textContent;
                let bMosScore = cdrDoc.childNodes[0].childNodes[22].childNodes[4].textContent;
                let caller = cdrDoc.childNodes[0].childNodes[22].childNodes[8].textContent
                let called = cdrDoc.childNodes[0].childNodes[22].childNodes[9].textContent;
                let aJitter = cdrDoc.childNodes[0].childNodes[22].childNodes[12].textContent;
                let bJitter = cdrDoc.childNodes[0].childNodes[22].childNodes[13].textContent;
                let aPacketLoss = cdrDoc.childNodes[0].childNodes[22].childNodes[14].textContent;
                let bPacketLoss = cdrDoc.childNodes[0].childNodes[22].childNodes[15].textContent;
                let aRTCPJitter = cdrDoc.childNodes[0].childNodes[22].childNodes[16].textContent;
                let bRTCPJitter = cdrDoc.childNodes[0].childNodes[22].childNodes[17].textContent;
                // console.log(cdrDoc.childNodes[0].childNodes[22].childNodes[1].textContent + " is the calldate");

                aMosScore = Number(aMosScore) / 10;
                bMosScore = Number(bMosScore)/10;
                aJitter = Number(aJitter)/10;
                bJitter = Number(bJitter)/10;
                aPacketLoss = Number(aPacketLoss)/10;
                bPacketLoss = Number(bPacketLoss)/10;
                aRTCPJitter = Number(aRTCPJitter)/10;
                bRTCPJitter = Number(bRTCPJitter)/10;


                let singleQOS = {
                    "Call Time": `${calldate}`,
                    "Call Duration": `${duration}`,
                    "Caller": `${caller}`,
                    "Caller MOS Score": `${aMosScore}`,
                    "Caller Jitter": `${aJitter}`,
                    "Caller RTCP Jitter": `${aRTCPJitter}`,
                    "Caller Packet Loss": `${aPacketLoss}`,
                    "Dialed Number": `${called}`,
                    "Dialed MOS Score": `${bMosScore}`,
                    "Dialed Jitter": `${bJitter}`,
                    "Dialed RTCP Jitter": `${bRTCPJitter}`,
                    "Dialed Packet Loss": `${bPacketLoss}`
                };

                qosData.push(singleQOS);
            } else {
                console.log('No qos_orig found');
                let singleQOS = {};
                qosData.push(singleQOS);
            }
            // generateCSV(qosData);
        }    
        generateCSV(qosData, callReportCount, reportDownloadCounter, callCounter);
    }
    // generateCSV(qosData);
}

var qosQueue = [];

const parseCDR = function(responseXML) {
    // responseXML = responseXML;
    console.log("parseCDR() is now showing responseXML as " + responseXML.firstChild.textContent);
    let callIdList = responseXML.firstChild.getElementsByTagName('cdr_id');
    callReportCount = callIdList.length;
    console.log(callIdList.length);
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
                // debugger;
                // if (callCounter == (callIdList.length)) {
                //     console.log('qosData in parseCDR() shows as ' + qosData);
                //     setTimeout(generateCSV(qosData), 5000);
                // } else {
                //     callCounter++;
                //     console.log(callCounter);
                //     sendQosRequest(qosBody);
                // }
                callCounter++;
                sendQosRequest(qosBody);
                
            }
            // generateCSV(qosData);
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