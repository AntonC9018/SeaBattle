var id;
var nick;
var initiative;

var myNavy;
var enemyNavy;

var awaitingReq = false;
var awaitingRes = false;


 // at start
{
  myNavy = new p5(sketch(true), window.document.getElementById('sk1'));
  document.querySelector('.nick').innerHTML = Math.random().toString(36).substr(2, 5);
  document.querySelector('.start').addEventListener('click', start);
}

function board() {
  enemyNavy = new p5(sketch(false), window.document.getElementById('sk2'));
}

function start() {

  let el = document.querySelector('.nick');
  el.setAttribute('contenteditable', 'false');
  nick = el.innerHTML;

  this.removeEventListener('click', start);
  ingame = true; // change game state when button is clicked

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText.charAt(0) === '#') {
         let s = this.responseText.slice(1);
         let a = s.split(',');
         console.log(a);
         id = a[0].toString();
         initiative = parseInt(a[1]);
         if (initiative === 1) awaitReqRespond();
         board();
      }
    }
  }

  xhttp.open("GET", "games/new/" + nick, true);
  xhttp.send();
}


// Starts a full request — await respond — await request — respond cycle
// The function are listed below in sequential order
function cycle(i, j) {
  if (awaitingReq || awaitingRes) {
    console.log('Awaiting req or res. Shooting not allowed');
    return;
  }
  console.log('start chain');

  // chain full request-respond cycle !!!


  // send request
  request(i, j).then(res => {
    console.log('Request successful.');


    // wait for respond
    awaitRes().then(res => {
      console.log('Response acquired: ' + res);
      if (res === 'true') { // it hit a ship
        console.log('A ship has been hit!');
        initiative = 1;
        enemyNavy.cells[i][j] = 2;
      } else if (res === 'false') { // it hit an empty space
        console.log('An empty space has been hit!');
        initiative = 1;
        enemyNavy.cells[i][j] = 1;
      } else {
        console.log('error: ' + res);
      }

      // wait for request and respond
      awaitReqRespond();

    }).catch(err => console.log('An error occured while waiting for respond: ' + err + '. The cycle has been stopped unexpectedly'))
  }).catch(err => console.log('An error occured while sending request: ' + err + '. The cycle has been stopped unexpectedly'))
}

// These functions are key for player-server interactions
function request(x, y) {

  console.log('sending a request');
  return new Promise(function(resolve, reject) {

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText === 'success') {
          resolve(this.responseText);
        } else {
          reject(this.responseText);
        }
      }
    }

    xhttp.open("GET", `games/req/${id}/${nick}/${x}/${y}`, true);
    xhttp.send();
  })
}

function awaitRes() {

  awaitingRes = true;
  return new Promise(function(resolve, reject) {

    if (awaitingReq) {
      reject('You are waiting for request')
      return;
    }
    console.log('Waiting for response');
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText.charAt(0) === '#') {
          awaitingRes = false;
          let s = this.responseText.slice(1);
          resolve(s);
        } else {
          awaitingRes = false;
          console.log('error: ' + this.responseText);
          reject(this.responseText);
        }
      }
    }

    xhttp.open("GET", `games/res/${id}/${nick}` , true);
    xhttp.send();
  });
}

function awaitReq() {
  return new Promise(function (resolve, reject) {
    console.log('waiting for request');
    _awaitReq().then(function(res) {
      let x = res[0];
      let y = res[1];

      let effect = myNavy.shoot(x, y).toString();
      console.log(`Being shot at ${x}, ${y}. The effect: ${effect}`);
      if (effect !== 'error') {
        resolve(effect);
      } else {
        reject(effect);
      }
    })
  })
}

function _awaitReq() {

  awaitingReq = true;

  return new Promise(function(resolve, reject) {

    if (awaitingRes) {
      reject('You are waiting for respond!');
      return;
    }


    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText.charAt(0) === '#') {
          awaitingReq = false;
          let s = this.responseText.slice(1);
          let a = s.split(',');
          resolve(a);
        } else {
          awaitingReq = false;
          reject(this.responseText);
        }
      }
    }

    xhttp.open("GET", `games/req/${id}/${nick}` , true);
    xhttp.send();
  });
}

function respond(message) {
  return new Promise(function(resolve, reject) {
    console.log('Sending a response');
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText === 'success') {
          resolve(this.responseText);
        } else {
          reject(this.responseText);
        }
      }
    }

    xhttp.open("GET", `games/res/${id}/${nick}/${message}` , true);
    xhttp.send();
  });
}

function awaitReqRespond() {
  awaitReq().then(effect => {
    console.log('Request acuired. Responding');

    respond(effect).then(res => {
      initiative = 0;
      console.log('cycle ended!');

    }).catch(err => console.log('An error occured while responding. ' + err + '. The cycle has been stopped unexpectedly'))
  }).catch(err => console.log('An error occured while waiting for request: ' + err + '. The cycle has been stopped unexpectedly'))
}





function state() {
  console.log((awaitingReq ? 'Awaiting request' : '\n') + (awaitingRes ? 'Awaiting response' : ''));
}

function stop() {
  awaitReq = false;
  awaitRes = false;
}
