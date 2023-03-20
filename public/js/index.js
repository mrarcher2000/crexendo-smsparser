// import * as fetch from 'node-fetch';
// const fetch = require('node-fetch');
const rawXMLElement = document.querySelector('#rawXMLElement');
const appendDataElement = document.querySelector('#appendData');
var domainInput = document.querySelector('#domain');
var userInput = document.querySelector('#user');
var formData = document.querySelector('#userData');

let url = 'https://crexendo-core-021-las.cls.iaas.run/ns-api/?object=conversation&action=read';

var reqbody = '{"domain":"Archer_Nicholson_Lab","user":"100"}';

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
    // let last_time = parent.getElementsByTagName("last_time").textContent;
    // let last_mesg = parent.getElementsByTagName("last_mesg").textContent;
    appendDataElement.insertAdjacentHTML("afterend", 
      `<div>
      <button id="searchresult${i}" type="button" class="btn btn-secondary btn-lg btn-block">${remote} : Last Message: ${last_mesg} at ${last_timestamp}</button>
      <h4>${remote} : <span>Last Message: ${last_mesg} at ${last_timestamp}</span></h4>
      <br />`
    );
    conversationList.push(`${parent.childNodes[0].textContent}`);
    // console.log(parent.childNodes[5].textContent);
  }

  console.log(conversationList);
  createConversationLinks(conversationList);
}

var createConversationLinks = function(conversationList) {

  // let conversationValues = conversationList.values();


  for (let i=0; i<conversationList.length;i++) {
    document.querySelector(`#searchresult${i}`).addEventListener("click", (e) => {
      e.preventDefault();
      // console.log(conversationList[i][0]);
      goToConversation(conversationList[i]);
    });

  }
}


const msgDataNewWindow = function(messageXMLData) {
  // console.log('function msgDataNewWindow() has retrieved messageXMLData as: \n' + messageXMLData.firstChild.textContent);
  let specifiedMsgXML = messageXMLData.firstChild;

  let msdDataHTML = 
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

<script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>0
  `;

  let messageIDs = specifiedMsgXML.getElementsByTagName("id");
  for (let i=0; i < messageIDs.length; i++) {
    let timestamp = specifiedMsgXML.getElementsByTagName("timestamp")[i].textContent;
    let msgtype = specifiedMsgXML.getElementsByTagName("type")[i].textContent;
    let from_num = specifiedMsgXML.getElementsByTagName("from_num")[i].textContent;
    let from_uid = specifiedMsgXML.getElementsByTagName("from_uid")[i].textContent;
    let term_num = specifiedMsgXML.getElementsByTagName("term_num")[i].textContent;
    let term_uid = specifiedMsgXML.getElementsByTagName("term_uid")[i].textContent;
    let remotepath = specifiedMsgXML.getElementsByTagName("remotepath")[i].textContent;
    let msgtext = specifiedMsgXML.getElementsByTagName("text")[i].textContent;
    let status = specifiedMsgXML.getElementsByTagName("status")[i].textContent;
    let direction = specifiedMsgXML.getElementsByTagName("direction")[i].textContent;

    // TO DO: CREATE HTML FOR DATA ********************************************************************************
    
    let appendHTMLData = `
    <div>
      <p>Time
    </div>
    `;
    console.log(`timestamp`);
    // let timestampHTML = document.createTextNode(timestamp);
    // div.appendChild(timestampHTML);
  }

  // console.log(div);
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
  msghttp.setRequestHeader("Authorization", "Bearer 828c5a1fda4d42bbd9d80c458f5c2ec1");
  msghttp.send(msgReqBody);
}


xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    console.log(xhttp.responseXML);
    if (xhttp.responseXML.getElementsByTagName("session_id")) {
      xmlData = xhttp.responseXML.getElementsByTagName("session_id");
      console.log(xmlData);
      parseViaSession(xmlData);
    } 
    else {
      console.log("No SMS or Chat Sessions Found!");
    };
  };
};

function fetchData() {
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Authorization", "Bearer 828c5a1fda4d42bbd9d80c458f5c2ec1");
  xhttp.send(reqbody);
}


document.getElementById("submitbtn").addEventListener("click", (e) => {
  e.preventDefault();
  checkData();
});