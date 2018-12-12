var id;
var nick;
var initiative;

var myNavy;
var enemyNavy;

var awaitingReq = false;
var awaitingRes = false;

function salt() {
  return Math.random().toString(36).substr(2, 8);
}

 // at start
{
  myNavy = new p5(sketch(true), window.document.getElementById('sk1'));
  //document.querySelector('.nick').innerHTML = salt();
  document.querySelector('.start').addEventListener('click', start);
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
      requestAwaitRes(i, j).then(r => {
        if (r) return;
        else {
          // wait for request and respond
          awaitReqRespond();
        }
      }).catch(err => console.log('An error occured while waiting for respond: ' + err + '. The cycle has been stopped unexpectedly'));
}

function requestAwaitRes(i, j) {

  return new Promise(function(resolve, reject) {
    // send request
    request(i, j).then(res => {
      console.log('Request successful.');


      // wait for response
      awaitRes().then(res => {
        console.log('Response acquired: ' + res);

        if (res === 'true') { // it hit a ship
          console.log('A ship has been hit!');
          initiative = 0;
          enemyNavy.cells[i][j] = 2;
          resolve(true);

        } else if (res === 'false') { // it hit an empty space
          console.log('An empty space has been hit!');
          initiative = 1;
          enemyNavy.cells[i][j] = 1;
          resolve(false);

        } else {
          console.log('error: ' + res);
          reject(res)
        }
      }).catch(r => console.log('An error occured while waiting for response. Error: ' + r))
    }).catch(r => console.log('An error occured while requesting. Error: ' + r))
  })
}


// These functions are key for player-server interactions
function request(x, y) {

  console.log('sending a request');
  return new Promise(function(resolve, reject) {

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let res = JSON.parse(this.responseText);
        if (res.response) {
          resolve(res.response);
        } else {
          reject(res.error);
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

    changeState('waiting');

    console.log('Waiting for response');
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {

        let res = JSON.parse(this.responseText);

        if (res.response) {

          awaitingRes = false;

          if (res.response === 'true') {
            changeState('ready');
          } else if (res.response === 'false') {
            changeState('fail');
          }
          resolve(res.response);

        } else {
          awaitingRes = false;
          console.log('error: ' + res.error);
          reject(res.error);
        }
      }
    }

    xhttp.open("GET", `games/res/${id}/${nick}` , true);
    xhttp.send();
  });
}

function awaitReq() {
  return new Promise(function (resolve, reject) {
    console.log('Checking if respond = null');
    requestClear().then(r => {

        console.log('Response = ' + r);

        console.log('waiting for REQUEST');
        _awaitReq().then(function(res) {
        let x = res.x;
        let y = res.y;

        let effect = myNavy.shoot(x, y).toString();
        console.log(`Being shot at ${x}, ${y}. The effect: ${effect}`);
        if (effect !== 'error') {
          resolve(effect);
        } else {
          reject(effect);
        }
      })
    })
  })
}

function _awaitReq() {

  awaitingReq = true;

  return new Promise(function(resolve, reject) {

    if (awaitingRes) {
      reject('You are waiting for response!');
      return;
    }


    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let res = JSON.parse(this.responseText);
        if (res.response) {
          awaitingReq = false;
          resolve(res.response.coordinates);
        } else {
          awaitingReq = false;
          reject(res.error);
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
        let res = JSON.parse(this.responseText);
        if (res.response) {
          resolve(res.response);
        } else {
          reject(res.error);
        }
      }
    }

    xhttp.open("GET", `games/res/${id}/${nick}/${message}` , true);
    xhttp.send();
  });
}

function awaitReqRespond() {
  awaitReq().then(effect => {
    console.log('Request acquired. Responding');

    respond(effect).then(res => {
      if (effect === 'true') {

        requestClear().then(r => {
          if (r) awaitReqRespond();
        })
        return;
      } else {
        initiative = 0;
        console.log('cycle ended!');
      }


    }).catch(err => console.log('An error occured while responding. ' + err + '. The cycle has been stopped unexpectedly'))
  }).catch(err => console.log('An error occured while waiting for request: ' + err + '. The cycle has been stopped unexpectedly'))
}


function requestClear() {
return new Promise(function(resolve, reject) {

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let r = JSON.parse(this.responseText);
        if (r.response === 'done') {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    }

    xhttp.open("GET", `games/clear/${id}` , true);
    xhttp.send();
  })
}





function state() {
  console.log((awaitingReq ? 'Awaiting request' : '\n') + (awaitingRes ? 'Awaiting response' : ''));
}

function stop() {
  awaitReq = false;
  awaitRes = false;
}
