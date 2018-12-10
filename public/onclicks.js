
function changeState(event) {
  if (stateScreen.state === 'waiting') {
    stateScreen.state = 'ready';
    let el = document.getElementById('change-state');
    el.classList.remove('waiting');
    el.classList.add('ready');
  } else {
    stateScreen.state = 'waiting';
    let el = document.getElementById('change-state');
    el.classList.remove('ready');
    el.classList.add('waiting');
  }
}
