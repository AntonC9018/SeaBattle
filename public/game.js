var id;
var nick;
var initiative;
var navy = new p5(sketch(true), window.document.getElementById('sk1'));;

var fake;

document.querySelector('.nick').innerHTML = Math.random().toString(36).substr(2, 5);
function board() {
  fake = new p5(sketch(false), window.document.getElementById('sk2'));
}

document.querySelector('.start').addEventListener('click', start)

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
         id = a[0];
         initiative = parseInt(a[1]);
         if (initiative === 1) awRes();
         board();
      }
    }
  }

  xhttp.open("GET", "games/new/" + nick, true);
  xhttp.send();
}

function awaitReq() {
  return new Promise(function(resolve, reject) {

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText.charAt(0) === '#') {
          let s = this.responseText.slice(1);
          let a = s.split(',');
          resolve(a);
        }
      }
    }

    xhttp.open("GET", `games/req/${id}/${nick}` , true);
    xhttp.send();
  });
}

function respond(message) {
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

    xhttp.open("GET", `games/res/${id}/${nick}/${message}` , true);
    xhttp.send();
  });
}

function request(x, y) {

  return new Promise(function(resolve, reject) {

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText === 'success') {

          let xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              if (this.responseText.charAt(0) === '#') {
                let s = this.responseText.slice(1);
                resolve(s);
              } else {
                reject(this.readyState);
              }
            }
          }

          xhttp.open("GET", `games/res/${id}/${nick}` , true);
          xhttp.send();



        } else {
          console.log('error: ' + this.responseText);
          reject(this.responseText);
        }
      }
    }

    xhttp.open("GET", `games/req/${id}/${nick}/${x}/${y}`, true);
    xhttp.send();
    // body...
  })
}


var awRes = function() {
  awaitReq().then(function(res) {
    let x = res[0];
    let y = res[1];

    let effect = navy.shot(x, y).toString();
    console.log(effect);
    if (effect !== 'error')
      respond(effect).then(function(res) {
        initiative = 0;
        console.log('cycle ended!');
      });
  })
}
