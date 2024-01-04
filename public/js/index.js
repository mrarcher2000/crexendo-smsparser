// import * as fetch from 'node-fetch';
// const fetch = require('node-fetch');
const rawXMLElement = document.querySelector('#rawXMLElement');
const appendDataElement = document.querySelector('#appendData');
const appendErrorElement = document.querySelector('#appendError');
var domainInput = document.querySelector('#domain');
var userInput = document.querySelector('#user');
var formData = document.querySelector('#userData');
var loginFormUser = document.querySelector('#loginFormUser');
var loginFormPassword = document.querySelector('#loginFormPassword');
var loginFormSubmit = document.querySelector('#loginFormSubmit');
var loginFormModal = new bootstrap.Modal(document.querySelector('#modalLoginForm'));
// var loginFormModal = document.querySelector('#modalLoginForm');

let url = 'https://crexendo-core-021-las.cls.iaas.run/ns-api/?object=conversation&action=read';

var reqbody = '{"domain":"Archer_Nicholson_Lab","user":"100"}';

var ns_access = "";
window.onload = function() {
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
};

var checkNSAccess = function(NSAccess) {
  if (NSAccess == "") {
    location.reload();
  } else {
    return NSAccess;
  }
}

function checkData() {
  console.log(domainInput.value + userInput.value);
  reqbody = `{"domain": "${domainInput.value}", "user":"${userInput.value}"}`;
  fetchData();
}

var xhttp = new XMLHttpRequest();
let xmlData;


var msghttp = new XMLHttpRequest();

var conversationList = [];

function parseViaSession(xmlData) {
  for (let i=0; i < xmlData.length; i++) {
    console.log(xmlData[i].parentNode);
    let parent = xmlData[i].parentNode;
    let remote = parent.childNodes[3].textContent;
    let last_timestamp = parent.childNodes[5].textContent;
    let last_mesg = parent.childNodes[7].textContent;
    appendDataElement.insertAdjacentHTML("afterend", 
      `<div>
      <button id="searchresult${i}" type="button" class="btn btn-secondary btn-lg btn-block" style="background-color:#0080be!important">${remote} : ${last_mesg} at ${last_timestamp}</button>
      <p class="text-center" style="font-weight:600;">| ${remote} | <span style="font-weight:200;">Last Message: ${last_mesg} at ${last_timestamp}</span></p>
      <br />`
    );
    conversationList.push(`${parent.childNodes[0].textContent}`);
    // console.log(parent.childNodes[5].textContent);
  }

  console.log(conversationList);
  createConversationLinks(conversationList);
}

var createConversationLinks = function(conversationList) {
  for (let i=0; i<conversationList.length;i++) {
    document.querySelector(`#searchresult${i}`).addEventListener("click", (e) => {
      e.preventDefault();
      // console.log(conversationList[i][0]);
      goToConversation(conversationList[i]);
    });

  }
}


const checkRemotepath = function(remotepath) {
  if (remotepath == '') {return ``} else {return `This message contained a media file. Click <a href="${remotepath}">here</a> to view.`}
};

const msgDataNewWindow = function(messageXMLData) {
  // console.log('function msgDataNewWindow() has retrieved messageXMLData as: \n' + messageXMLData.firstChild.textContent);
  let specifiedMsgXML = messageXMLData.firstChild;

  let msgDataHTML = 
  `
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="CrexendoVIP SMS Parser" />
    <meta name="author" content="CrexendoVIP Archer Nicholson VoIP Engineer" />
    <title>Message Data</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
</head>
  `;

  let messageIDs = specifiedMsgXML.getElementsByTagName("id");
  for (let i=0; i < messageIDs.length; i++) {
    let timestamp = specifiedMsgXML.getElementsByTagName("timestamp")[i].textContent;
    let msgtype = specifiedMsgXML.getElementsByTagName("type")[i].textContent;
    let from_num = specifiedMsgXML.getElementsByTagName("from_num")[i].textContent;
    let from_uid = specifiedMsgXML.getElementsByTagName("from_uid")[i].textContent;
    let term_num = specifiedMsgXML.getElementsByTagName("term_num")[i].textContent;
    let term_uid = specifiedMsgXML.getElementsByTagName("term_uid")[i].textContent;
    let remotepath = ''
    if (msgtype == "mms") {
      let tempXMLparent = specifiedMsgXML.getElementsByTagName("message")[i];
      remotepath = tempXMLparent.getElementsByTagName("remotepath")[0].textContent;
    } else {remotepath = ``;}

    let msgtext = specifiedMsgXML.getElementsByTagName("text")[i].textContent;
    let status = specifiedMsgXML.getElementsByTagName("status")[i].textContent;
    let direction = specifiedMsgXML.getElementsByTagName("direction")[i].textContent;
    
    let appendHTMLData = `
    <div class="card text-break">
    <div class="card-body">
      <p class="text-start fs-3 fw-bold" style="font-weight:bold;">${from_num ? `${from_num}` : `${from_uid}`} to ${term_num ? `${term_num}` : `${term_uid}`} <span class="fw-light" style="font-weight: bolder;"> at ${timestamp}</span></p>
      <p class="fs-4 fw-bold">${msgtext}</p>
      ${checkRemotepath(remotepath)}
    </div>
    </div> </br>
    `;
    msgDataHTML += appendHTMLData;
  }

  var script = document.createElement('script');
  var htmlText = document.createTextNode(`
  const downloadbtn = document.querySelector("#downloadbtn");
  const downloadFunction = function() {
    const html = document.querySelector('body').innerText;
    const blobData = new Blob([html], {type: 'text/plain;charset=utf-8'});

    let blobURL = URL.createObjectURL(blobData);

    const anchor = document.createElement('a');
    anchor.href = blobURL;
    anchor.target = "_blank";
    anchor.download = "";

    anchor.click();

    URL.revokeObjectURL(blobURL);
  }
  downloadbtn.addEventListener('click', (e) => {
    e.preventDefault();
    downloadFunction();
  });
  `);
  script.type = 'text/javascript';
  // script.src = '/js/messagedownload.js';
  script.appendChild(htmlText);
  // msgDataHTML += script;
  // console.log(msgDataHTML);
  var win = window.open("", "_blank");
  win.document.body.innerHTML = (`<button id="downloadbtn" class="btn btn-primary">Click to Download SMS Conversation</button><br />`+ msgDataHTML + `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>`);
  win.document.body.appendChild(script);
}


msghttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    console.log(msghttp.responseXML);

    let messageInfo = msghttp.responseXML;
    
    msgDataNewWindow(messageInfo);
    // let msgNewWindow = window.open("", "", '_blank');
    // msgNewWindow.document.write(msghttp.responseXML);
  } 
}

var goToConversation = function(session_id) {
  console.log(session_id);
  let msgReqBody = `{"domain": "${domainInput.value}", "user":"${userInput.value}", "session_id": "${session_id}", "limit":"1000"}`;
  msghttp.open("POST", "https://crexendo-core-021-las.cls.iaas.run/ns-api/?object=message&action=read");
  msghttp.setRequestHeader("Authorization", `Bearer ${checkNSAccess(ns_access)}`);
  msghttp.send(msgReqBody);
}


xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    appendErrorElement.innerHTML = '';
    console.log(xhttp.responseXML);
    if (xhttp.responseXML.getElementsByTagName("session_id")) {
      xmlData = xhttp.responseXML.getElementsByTagName("session_id");
      console.log(xmlData);
      parseViaSession(xmlData);
    } 
    else {
      console.log("No SMS or Chat Sessions Found!");
    };
  } else if (this.readyState == 4 && this.status !== 200) {
    console.log("Status: "+ xhttp.status + "\n Error:" + xhttp.responseText);
    appendErrorElement.innerHTML = `<p class='text-danger'>Error! Status: ${xhttp.status}</p>`;
  };
};

function fetchData() {
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Authorization", `Bearer ${checkNSAccess(ns_access)}`);
  xhttp.send(reqbody);
}


document.getElementById("submitbtn").addEventListener("click", (e) => {
  e.preventDefault();
  checkData();
});