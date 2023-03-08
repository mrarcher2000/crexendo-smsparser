// import * as fetch from 'node-fetch';
// const fetch = require('node-fetch');
const rawXMLElement = document.querySelector('#rawXMLElement');
const appendDataElement = document.querySelector('#appendData');
var domainInput = document.querySelector('#domain');
var userInput = document.querySelector('#user');
var formData = document.querySelector('#userData');

let url = 'https://crexendo-core-021-las.cls.iaas.run/ns-api/?object=conversation&action=read';

// let options = {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: 'Bearer 25d810d1ade08e833acde4214d2e4b70'
//   },
//   body: '{"domain":"Archer_Nicholson_Lab","user":"100"}'
// };

var reqbody = '{"domain":"Archer_Nicholson_Lab","user":"100"}';

function checkData() {
  console.log(domainInput.value + userInput.value);
  reqbody = `{"domain": "${domainInput.value}", "user":"${userInput.value}"}`;
  fetchData();
}

var xhttp = new XMLHttpRequest();
let xmlData;

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
      <h4>${remote} : <span>Last Message: ${last_mesg} at ${last_timestamp}</span></h4>
      <br />`
    );
    // console.log(parent.childNodes[5].textContent);
  }
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
  xhttp.setRequestHeader("Authorization", "Bearer ccc2212e03770a0a7d2f38d84533ad91");
  xhttp.send(reqbody);
}


document.getElementById("submitbtn").addEventListener("click", (e) => {
  e.preventDefault();
  checkData();
});