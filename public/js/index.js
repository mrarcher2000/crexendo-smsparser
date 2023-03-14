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
      <button id="searchresult[${i}]" type="button" class="btn btn-secondary btn-lg btn-block">${remote} : Last Message: ${last_mesg} at ${last_timestamp}</button>
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
  for (i=0;i<conversationList.length;i++) {
    document.querySelector(`#searchresult[${i}]`).addEventListener("click", (e) => {
      e.preventDefault();
      goToConversation(conversationList[i]);
    });

  }
}

msghttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    console.log(msghttp.responseXML);
  }
}

var goToConversation = function(session_id) {
  let msgReqBody = `{"domain": "${domainInput}", "user":"${userInput}", "session_id": "${session_id}", "limit":"1000"}`;
  msghttp.open("POST", "https://crexendo-core-021-las.cls.iaas.run/ns-api/?object=message&action=read");
  msghttp.setRequestHeader("Authorization", "Bearer d2375cb0aed7615cee01c29d9833651f");
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
  xhttp.setRequestHeader("Authorization", "Bearer d2375cb0aed7615cee01c29d9833651f");
  xhttp.send(reqbody);
}


document.getElementById("submitbtn").addEventListener("click", (e) => {
  e.preventDefault();
  checkData();
});