const board = document.getElementById("apron-board");
const aircraftLayer = document.getElementById("aircraft-layer");
const selectedAircraft = document.getElementById("selected-aircraft");
const liveData = document.getElementById("live-data");

const rotateLeftBtn = document.getElementById("rotate-left-btn");
const rotateRightBtn = document.getElementById("rotate-right-btn");
const sizeDownBtn = document.getElementById("size-down-btn");
const sizeUpBtn = document.getElementById("size-up-btn");
const exportBtn = document.getElementById("export-btn");
const resetBtn = document.getElementById("reset-btn");
const importFile = document.getElementById("import-file");

const initialAircraftData = [
  { stand: "G1",  x: 42.0, y: 30.2, rotation: 18,  size: 3.8 },
  { stand: "16",  x: 47.7, y: 34.2, rotation: 18,  size: 4.2 },
  { stand: "15",  x: 54.5, y: 33.6, rotation: 18,  size: 4.2 },
  { stand: "14",  x: 60.2, y: 33.4, rotation: 18,  size: 4.2 },
  { stand: "13",  x: 66.2, y: 33.0, rotation: 18,  size: 4.2 },
  { stand: "6",   x: 72.3, y: 32.8, rotation: 18,  size: 4.2 },

  { stand: "1A",  x: 19.1, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "1B",  x: 24.4, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "2",   x: 29.5, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "2A",  x: 34.3, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "2B",  x: 39.2, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "4",   x: 45.6, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "5",   x: 51.2, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "6B",  x: 56.1, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "7",   x: 61.2, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "8",   x: 68.1, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "9",   x: 73.0, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "10",  x: 77.9, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "11",  x: 83.0, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "12A", x: 88.4, y: 74.0, rotation: 180, size: 4.9 }
];

let aircraftData = JSON.parse(JSON.stringify(initialAircraftData));
let selectedStand = null;
let dragState = null;

function aircraftSvg(rotation) {
  return `
    <img src="./plane.svg" alt="" style="width:100%; height:100%; transform: rotate(${rotation}deg); pointer-events:none;" />
  `;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAircraftByStand(stand) {
  return aircraftData.find((item) => item.stand === stand);
}

function updateLivePanel() {
  if (selectedStand) {
    const aircraft = getAircraftByStand(selectedStand);
    selectedAircraft.textContent =
      `Stand ${aircraft.stand} | x=${aircraft.x.toFixed(2)} | y=${aircraft.y.toFixed(2)} | rotation=${aircraft.rotation.toFixed(1)} | size=${aircraft.size.toFixed(2)}`;
  } else {
    selectedAircraft.textContent = "None selected.";
  }

  liveData.textContent = JSON.stringify(aircraftData, null, 2);
}

function renderAircraft() {
  aircraftLayer.innerHTML = "";

  aircraftData.forEach((plane) => {
    const button = document.createElement("button");
    button.className = "aircraft";
    if (plane.stand === selectedStand) {
      button.classList.add("selected");
    }

    button.type = "button";
    button.dataset.stand = plane.stand;
    button.setAttribute("aria-label", `Aircraft at stand ${plane.stand}`);
    button.style.left = `${plane.x}%`;
    button.style.top = `${plane.y}%`;
    button.style.width = `${plane.size}%`;
    button.innerHTML = aircraftSvg(plane.rotation);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedStand = plane.stand;
      renderAircraft();
      updateLivePanel();
    });

    button.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      selectedStand = plane.stand;
      dragState = {
        stand: plane.stand,
        pointerId: e.pointerId
      };

      document.body.classList.add("dragging-aircraft");
      button.classList.add("dragging");

      try {
        button.setPointerCapture(e.pointerId);
      } catch (_) {}

      updateLivePanel();
    });

    button.addEventListener("pointermove", (e) => {
      if (!dragState || dragState.stand !== plane.stand) return;

      e.preventDefault();

      const rect = board.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      plane.x = clamp(x, 0, 100);
      plane.y = clamp(y, 0, 100);

      button.style.left = `${plane.x}%`;
      button.style.top = `${plane.y}%`;

      updateLivePanel();
    });

    button.addEventListener("pointerup", (e) => {
      if (!dragState || dragState.stand !== plane.stand) return;
      dragState = null;
      button.classList.remove("dragging");
      document.body.classList.remove("dragging-aircraft");
      try {
        button.releasePointerCapture(e.pointerId);
      } catch (_) {}
      renderAircraft();
    });

    button.addEventListener("pointercancel", (e) => {
      if (!dragState || dragState.stand !== plane.stand) return;
      dragState = null;
      button.classList.remove("dragging");
      document.body.classList.remove("dragging-aircraft");
      try {
        button.releasePointerCapture(e.pointerId);
      } catch (_) {}
      renderAircraft();
    });

    aircraftLayer.appendChild(button);
  });

  updateLivePanel();
}

function changeRotation(delta) {
  if (!selectedStand) return;
  const aircraft = getAircraftByStand(selectedStand);
  aircraft.rotation = (aircraft.rotation + delta + 360) % 360;
  renderAircraft();
}

function changeSize(delta) {
  if (!selectedStand) return;
  const aircraft = getAircraftByStand(selectedStand);
  aircraft.size = clamp(aircraft.size + delta, 2.0, 8.0);
  renderAircraft();
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

rotateLeftBtn.addEventListener("click", () => changeRotation(-2));
rotateRightBtn.addEventListener("click", () => changeRotation(2));
sizeDownBtn.addEventListener("click", () => changeSize(-0.15));
sizeUpBtn.addEventListener("click", () => changeSize(0.15));

exportBtn.addEventListener("click", () => {
  downloadJson("aircraft-layout.json", aircraftData);
});

resetBtn.addEventListener("click", () => {
  aircraftData = JSON.parse(JSON.stringify(initialAircraftData));
  selectedStand = null;
  renderAircraft();
});

importFile.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error("Imported JSON must be an array.");
    }

    aircraftData = parsed.map((item) => ({
      stand: item.stand,
      x: Number(item.x),
      y: Number(item.y),
      rotation: Number(item.rotation),
      size: Number(item.size)
    }));

    selectedStand = null;
    renderAircraft();
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }

  importFile.value = "";
});

board.addEventListener("click", () => {
  selectedStand = null;
  renderAircraft();
});

window.addEventListener("pointerup", () => {
  dragState = null;
  document.body.classList.remove("dragging-aircraft");
});

window.addEventListener("pointercancel", () => {
  dragState = null;
  document.body.classList.remove("dragging-aircraft");
});

renderAircraft();
