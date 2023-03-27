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


const checkRemotepath = function(remotepath) {
  if (remotepath == '') {return ``} else {return `Link to Media: ${remotepath}`}
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
    <div class="cart-body">
      <p class="text-start fs-3 fw-semibold">${from_num ? `${from_num}` : `${from_uid}`} to ${term_num ? `${term_num}` : `${term_uid}`}</p>
      <p class="fs-4 fw-normal">${msgtext} <span class="fw-light">${timestamp}</span></p>
      ${checkRemotepath(remotepath)}
    </div>
    </div> </br>
    `;
    msgDataHTML += appendHTMLData;
    // let timestampHTML = document.createTextNode(timestamp);
    // div.appendChild(timestampHTML);
  }

  console.log(msgDataHTML);
  var win = window.open("", "_blank", "width=100%, height=100%, top=100%, left=100%");
  var winScript = document.createElement('script');
  var winScript2 = document.createElement('script');
  winScript.src = "https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js";
  winScript.integrity = "sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q";
  winScript.crossOrigin = "anonymous";
  winScript2.src = "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js";
  winScript2.integrity = "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl";
  winScript2.crossOrigin = "anonymous";
  // var winStylesheet = document.createElement('link');
  // winStylesheet.rel = 'stylesheet';
  // winStylesheet.href = 'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css'
  win.document.body.innerHTML = msgDataHTML;

  // win.appendChild(winScript);
  // win.appendChild(winScript2);

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
  msghttp.setRequestHeader("Authorization", "Bearer 678dae1ef391e82ff73583219608a340");
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
  xhttp.setRequestHeader("Authorization", "Bearer 678dae1ef391e82ff73583219608a340");
  xhttp.send(reqbody);
}


document.getElementById("submitbtn").addEventListener("click", (e) => {
  e.preventDefault();
  checkData();
});