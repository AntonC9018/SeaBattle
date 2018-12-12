
// tick — waiting
function changeState(state) {
  let el = document.getElementById('sk3');
  let cl = el.className;

  if (state) {
    el.className = state;
    stateScreen.reset();
    stateScreen.state = state;
  }

  else if (cl === 'hidden') {
    el.className = 'waiting';
  } else {
    el.className = 'hidden';
  }

}

window.addEventListener('resize', setOffset);

// offset stateScreen (see state.js)
function setOffset() {
  let elstate = document.getElementById('sk3');
  let elsket = document.querySelector('#sk2 canvas');

  if (!elsket) return;

  let coords = elsket.getBoundingClientRect();

  elstate.style.left = coords.left + 'px';
  elstate.style.top = coords.top + 'px';
  elstate.style.width = coords.width + 'px';
  elstate.style.height = coords.height + 'px';
}

// create board for enemy navy
function board() {
  enemyNavy = new p5(sketch(false), window.document.getElementById('sk2'));
}

// on "start"-button click
function start() {

  myNavy.shipSilhouette = null;

  let enemy = document.getElementById('enemy');
  enemy.classList.remove('hidden');

  // create board for enemy navy and
  board();

  // offset the stateScreen
  setOffset();

  // let the thing run
  changeState('waiting');

  // get nick
  let el = document.querySelector('.nick');
  el.setAttribute('contenteditable', 'false');
  nick = salt() + el.innerHTML;

  this.removeEventListener('click', start);
  ingame = true; // change game state when button is clicked

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(this.responseText);
      if (res.response) {

        // parse id and initiative
        enemyName = res.response.enemyName.slice(8);
        id = res.response.id;
        initiative = parseInt(res.response.initiative);

        enemy.innerHTML = enemyName;

        // if go second, await request and then respond
        if (initiative === 1) awaitReqRespond();

        changeState('ready')
      }
    }
  }

  xhttp.open("GET", "games/new/" + nick, true);
  xhttp.send();
}
// document.getElementById('sk3').addEventListener('click', stopProp);
// function stopProp(event) {
//   console.log(event.target);
//   event.stopPropagation();
// }
// document.getElementById('sk2').addEventListener('click', stopProp);
