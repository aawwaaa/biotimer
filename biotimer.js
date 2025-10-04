const timerContainer = document.getElementById('timer');
const timerBackground = document.getElementById('timer-background');
const timerText = document.getElementById('timer-text');
const deltatContainer = document.getElementById('deltat');
const deltaTText = document.getElementById('deltat-text');
const counterText = document.getElementById('counter-text');
const settings = document.getElementById('settings');
const start = document.getElementById('start');
const pause = document.getElementById('pause');
const resume = document.getElementById('resume');
const reset = document.getElementById('reset');
const stop = document.getElementById('stop');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const fullscreen = document.getElementById('fullscreen');
const timerIntervalInput = document.getElementById('timer-inverval');
const counterMaxInput = document.getElementById('counter-max');
const autoContinueInput = document.getElementById('auto-continue');
const backgroundFilesInput = document.getElementById('background-files');
const clearBackgroundFiles = document.getElementById('clear-background-files');

let state = "stopped" // "stopped", "paused", "running"

let operations = {
    all: [
        start, pause, resume, stop, prev, next, fullscreen, reset
    ],
    stopped: [
        start, fullscreen, reset
    ],
    paused: [
        resume, stop, prev, next, fullscreen, reset
    ],
    running: [
        pause, stop, prev, next, fullscreen, reset
    ]
}

let config = {
    timerInterval: 50,
    counterMax: 10,
    autoContinue: false,
    backgroundFiles: [],
}

function updateConfig() {
    config.timerInterval = timerIntervalInput.value;
    config.counterMax = counterMaxInput.value;
    config.autoContinue = autoContinueInput.checked;
    config.backgroundFiles = Array.from(backgroundFilesInput.files);

    config.backgroundFiles.sort((a, b) => a.name.localeCompare(b.name));
    console.log(config.backgroundFiles)
}

function updateState(newState) {
    state = newState;
    for (let operation of operations.all) {
        operation.style.display = "none";
    }
    for (let operation of operations[state]) {
        operation.style.display = "block";
    }
}

let timer = {
    start: 0,
    pause: 0,
    expected: 0,

    counter: 0,
}

function updateTimer() {
    const now = Date.now();
    const pause = state != "running" ? now - timer.pause : 0;
    const passed = now - timer.start - pause;
    const left = config.timerInterval * 1000 - passed;
    timerText.textContent = (left < 0? "-": "") + Math.floor(Math.abs(left) / 1000) + "."
        + Math.floor(Math.abs(left) % 1000 / 10).toString().padStart(2, "0");
    if (left <= 0 && config.autoContinue && state == "running") {
        doNext();
    }

    const deltaT = - ((now - timer.expected) - pause);
    const sym = deltaT > 0 ? "+" : deltaT < 0 ? "-" : "";
    deltaTText.textContent = sym + Math.floor(Math.abs(deltaT) / 1000) + "."
        + Math.floor(Math.abs(deltaT) % 1000 / 10).toString().padStart(2, "0");
    deltatContainer.className = deltaT > 0 ? "positive" : deltaT < 0 ? "negative" : "";
}

function updateCounter(){
    counterText.textContent = timer.counter;
    const imageIndex = timer.counter - 1;
    if (config.backgroundFiles[imageIndex]) {
        timerBackground.src = URL.createObjectURL(config.backgroundFiles[imageIndex]);
        timerContainer.classList.add('with-image');
    } else {
        timerContainer.classList.remove('with-image');
    }
}

function doStart() {
    updateConfig();
    doReset();
    updateState("running");
    doNext();
}

function doPause() {
    if (state != "running") {
        return;
    }
    timer.pause = Date.now();
    updateState("paused");
}

function doResume() {
    if (state != "paused") {
        return;
    }
    const now = Date.now();
    timer.start += (now - timer.pause);
    timer.expected += (now - timer.pause);
    updateState("running");
}

function doStop() {
    if (state != "running") {
        doResume();
    }
    timer.pause = Date.now();
    updateState("stopped");
}

function doPrev() {
    timer.counter = Math.max(0, timer.counter - 1);
    timer.start = Date.now();
    timer.pause = Date.now();
    timer.expected -= config.timerInterval * 1000;
    updateCounter();
}

function doNext() {
    timer.counter = timer.counter + 1;
    if (timer.counter > config.counterMax) {
        doPause();
        return;
    }
    timer.start = Date.now();
    timer.pause = Date.now();
    timer.expected += config.timerInterval * 1000;
    updateCounter();
}

function doFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

function doReset() {
    timer = {
        start: Date.now(),
        pause: Date.now(),
        expected: Date.now(),

        counter: 0,
    }
    updateState("stopped");
    updateCounter();
}


start.addEventListener("click", doStart);
pause.addEventListener("click", doPause);
resume.addEventListener("click", doResume);
stop.addEventListener("click", doStop);
prev.addEventListener("click", doPrev);
next.addEventListener("click", doNext);
fullscreen.addEventListener("click", doFullscreen);
reset.addEventListener("click", doReset);
clearBackgroundFiles.addEventListener("click", () => {
    backgroundFilesInput.value = "";
});

doReset();

function update() {
    updateTimer();
    requestAnimationFrame(update);
}
requestAnimationFrame(update);