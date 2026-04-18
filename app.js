const board = document.getElementById("apron-board");
const aircraftLayer = document.getElementById("aircraft-layer");
const selectedAircraft = document.getElementById("selected-aircraft");
const liveData = document.getElementById("live-data");
const modeDescription = document.getElementById("mode-description");

const modeToggleBtn = document.getElementById("mode-toggle-btn");
const rotateLeftBtn = document.getElementById("rotate-left-btn");
const rotateRightBtn = document.getElementById("rotate-right-btn");
const sizeDownBtn = document.getElementById("size-down-btn");
const sizeUpBtn = document.getElementById("size-up-btn");
const exportBtn = document.getElementById("export-btn");
const resetBtn = document.getElementById("reset-btn");
const importLabel = document.getElementById("import-label");
const importFile = document.getElementById("import-file");

let initialAircraftData = [];
let aircraftData = [];
let selectedStand = null;
let dragState = null;
let appMode = "editor";

const illegalPushbacks = {
  "18": ["2B", "3", "4"],
  "17": ["3", "4", "5", "18"],
  "16": ["4", "5", "6", "17", "18"],
  "15": ["5", "6", "7", "16", "17"],
  "14": ["6", "7", "8", "9", "15", "16"],
  "13": ["8", "9", "10", "14", "15"],

  // Inferred fix from corrupted Excel date cell
  "12": ["10", "11", "13"],

  "11": ["9", "10", "13", "14"],
  "10": ["8", "9", "13", "14"],
  "9": ["7", "8", "14", "15"],
  "8": ["6", "7", "15", "16"],
  "7": ["5", "6", "16", "17"],
  "6": ["4", "5", "17", "18"],

  // Inferred fix from corrupted Excel date cell
  "5": ["3", "4", "18"]

  "4": ["2B", "3", "18"],
  "3": ["2A", "2B"],
  "2B": ["1B", "2A"],
  "2A": ["1A", "2B"],
  "1B": ["1A"],
  "1A": []
};

function aircraftSvg(rotation, state = "normal") {
  const filterMap = {
    normal: "",
    selected:
      "brightness(0.7) drop-shadow(0 0 7px rgba(34, 197, 94, 1)) drop-shadow(0 0 16px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 28px rgba(34, 197, 94, 0.45))",
    illegal:
      "brightness(0) saturate(100%) invert(16%) sepia(94%) saturate(7485%) hue-rotate(357deg) brightness(97%) contrast(119%) drop-shadow(0 0 6px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 14px rgba(239, 68, 68, 0.65))",
    hover:
      "brightness(0.8) drop-shadow(0 0 7px rgba(74, 222, 128, 0.95)) drop-shadow(0 0 16px rgba(74, 222, 128, 0.65)) drop-shadow(0 0 28px rgba(74, 222, 128, 0.35))"
  };

  return `
    <img
      src="./plane.svg"
      alt=""
      draggable="false"
      style="
        width:100%;
        height:100%;
        transform: rotate(${rotation}deg);
        pointer-events:none;
        user-select:none;
        filter:${filterMap[state]};
      "
    />
  `;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAircraftByStand(stand) {
  return aircraftData.find((item) => item.stand === stand);
}

function isEditorMode() {
  return appMode === "editor";
}

function getIllegalSetForSelection() {
  if (isEditorMode()) return new Set();
  if (!selectedStand) return new Set();

  const illegal = illegalPushbacks[selectedStand] || [];
  return new Set(illegal.map(String));
}

function getPlaneVisualState(stand) {
  const illegalSet = getIllegalSetForSelection();

  if (selectedStand === stand) {
    return "selected";
  }

  if (illegalSet.has(String(stand))) {
    return "illegal";
  }

  return "normal";
}

function updateModeUI() {
  const editorEnabled = isEditorMode();

  modeToggleBtn.textContent = editorEnabled
    ? "Switch to Use Mode"
    : "Switch to Editor Mode";

  modeDescription.textContent = editorEnabled
    ? "Editor Mode: drag aircraft, rotate, resize, import, export, and reset."
    : "Use Mode: click an aircraft to highlight illegal pushbacks in red.";

  document.body.classList.toggle("use-mode", !editorEnabled);

  rotateLeftBtn.disabled = !editorEnabled;
  rotateRightBtn.disabled = !editorEnabled;
  sizeDownBtn.disabled = !editorEnabled;
  sizeUpBtn.disabled = !editorEnabled;
  exportBtn.disabled = !editorEnabled;
  resetBtn.disabled = !editorEnabled;
  importFile.disabled = !editorEnabled;

  importLabel.classList.toggle("disabled", !editorEnabled);
}

function updateLivePanel() {
  if (selectedStand) {
    const aircraft = getAircraftByStand(selectedStand);
    const illegalList = isEditorMode()
      ? []
      : (illegalPushbacks[selectedStand] || []);

    selectedAircraft.textContent =
      `[${appMode.toUpperCase()}] Stand ${aircraft.stand} | x=${aircraft.x.toFixed(2)} | y=${aircraft.y.toFixed(2)} | rotation=${aircraft.rotation.toFixed(1)} | size=${aircraft.size.toFixed(2)}${
        illegalList.length ? ` | Illegal pushbacks: ${illegalList.join(", ")}` : ""
      }`;
  } else {
    selectedAircraft.textContent = `[${appMode.toUpperCase()}] None selected.`;
  }

  liveData.textContent = JSON.stringify(aircraftData, null, 2);
}

function renderAircraft() {
  aircraftLayer.innerHTML = "";

  aircraftData.forEach((plane) => {
    const button = document.createElement("button");
    button.className = "aircraft";
    button.type = "button";
    button.dataset.stand = plane.stand;
    button.setAttribute("aria-label", `Aircraft at stand ${plane.stand}`);
    button.style.left = `${plane.x}%`;
    button.style.top = `${plane.y}%`;
    button.style.width = `${plane.size}%`;
    button.innerHTML = aircraftSvg(plane.rotation, getPlaneVisualState(plane.stand));

    if (plane.stand === selectedStand) {
      button.classList.add("selected");
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedStand = plane.stand;
      renderAircraft();
    });

    button.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      selectedStand = plane.stand;
      updateLivePanel();

      if (!isEditorMode()) {
        return;
      }

      dragState = {
        stand: plane.stand,
        pointerId: e.pointerId
      };

      document.body.classList.add("dragging-aircraft");
      button.classList.add("dragging");

      try {
        button.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    button.addEventListener("pointermove", (e) => {
      if (!isEditorMode()) return;
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
  if (!isEditorMode()) return;
  if (!selectedStand) return;

  const aircraft = getAircraftByStand(selectedStand);
  aircraft.rotation = (aircraft.rotation + delta + 360) % 360;
  renderAircraft();
}

function changeSize(delta) {
  if (!isEditorMode()) return;
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

async function loadInitialLayout() {
  try {
    const response = await fetch("./aircraft-layout.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load layout JSON: ${response.status}`);
    }

    const parsed = await response.json();

    if (!Array.isArray(parsed)) {
      throw new Error("Layout JSON must be an array.");
    }

    initialAircraftData = parsed.map((item) => ({
      stand: String(item.stand),
      x: Number(item.x),
      y: Number(item.y),
      rotation: Number(item.rotation),
      size: Number(item.size)
    }));

    aircraftData = JSON.parse(JSON.stringify(initialAircraftData));
  } catch (error) {
    console.error(error);
    alert(`Could not load aircraft-layout.json: ${error.message}`);
    initialAircraftData = [];
    aircraftData = [];
  }
}

rotateLeftBtn.addEventListener("click", () => changeRotation(-2));
rotateRightBtn.addEventListener("click", () => changeRotation(2));
sizeDownBtn.addEventListener("click", () => changeSize(-0.15));
sizeUpBtn.addEventListener("click", () => changeSize(0.15));

exportBtn.addEventListener("click", () => {
  if (!isEditorMode()) return;
  downloadJson("aircraft-layout.json", aircraftData);
});

modeToggleBtn.addEventListener("click", () => {
  appMode = isEditorMode() ? "use" : "editor";
  dragState = null;
  document.body.classList.remove("dragging-aircraft");
  updateModeUI();
  renderAircraft();
});

resetBtn.addEventListener("click", () => {
  if (!isEditorMode()) return;

  aircraftData = JSON.parse(JSON.stringify(initialAircraftData));
  selectedStand = null;
  renderAircraft();
});

importFile.addEventListener("change", async (e) => {
  if (!isEditorMode()) return;

  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error("Imported JSON must be an array.");
    }

    aircraftData = parsed.map((item) => ({
      stand: String(item.stand),
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

async function initApp() {
  updateModeUI();
  await loadInitialLayout();
  renderAircraft();
}

initApp();
