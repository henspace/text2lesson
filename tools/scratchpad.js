
function log(msg) {
  console.log(`${new Date().toTimeString()}: ${msg}`);
}

function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 20000);
  }).then(() => {
    log('Timer finished');
  });
}


log(`STARTING DELAY`);
delay(); //.then(() => log('Completion of delay picked up.'));
log('End of script.');
