const board = document.getElementById("apron-board");
const aircraftLayer = document.getElementById("aircraft-layer");
const selectedAircraft = document.getElementById("selected-aircraft");

let placementMode = true;

board.addEventListener("click", (e) => {
  if (!placementMode) return;

  const rect = board.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  console.log(`x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`);

  const dot = document.createElement("div");
  dot.className = "crosshair";
  dot.style.left = `${x}%`;
  dot.style.top = `${y}%`;

  aircraftLayer.appendChild(dot);
});

const aircraftData = [
  { stand: "G1", x: 42.0, y: 30.2, rotation: 18, size: 3.8 },
  { stand: "16", x: 47.7, y: 34.2, rotation: 18, size: 4.2 },
  { stand: "15", x: 54.5, y: 33.6, rotation: 18, size: 4.2 },
  { stand: "14", x: 60.2, y: 33.4, rotation: 18, size: 4.2 },
  { stand: "13", x: 66.2, y: 33.0, rotation: 18, size: 4.2 },
  { stand: "6", x: 72.3, y: 32.8, rotation: 18, size: 4.2 },

  { stand: "1A", x: 19.1, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "1B", x: 24.4, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "2", x: 29.5, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "2A", x: 34.3, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "2B", x: 39.2, y: 73.0, rotation: 180, size: 4.9 },
  { stand: "4", x: 45.6, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "5", x: 51.2, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "6B", x: 56.1, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "7", x: 61.2, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "8", x: 68.1, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "9", x: 73.0, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "10", x: 77.9, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "11", x: 83.0, y: 74.0, rotation: 180, size: 4.9 },
  { stand: "12A", x: 88.4, y: 74.0, rotation: 180, size: 4.9 }
];

function aircraftSvg(rotation) {
  return `
    <svg viewBox="0 0 100 100" aria-hidden="true" style="transform: rotate(${rotation}deg)">
      <path d="
        M50 4
        C54 4, 57 8, 57 14
        L57 32
        L82 49
        C85 51, 86 56, 85 62
        L66 55
        L66 64
        L72 67
        L72 75
        L66 75
        L63 70
        L58 68
        L58 86
        L66 92
        L66 100
        L50 95
        L34 100
        L34 92
        L42 86
        L42 68
        L37 70
        L34 75
        L28 75
        L28 67
        L34 64
        L34 55
        L15 62
        C14 56, 15 51, 18 49
        L43 32
        L43 14
        C43 8, 46 4, 50 4
        Z
      "></path>
    </svg>
  `;
}

function renderAircraft() {
  aircraftLayer.querySelectorAll(".aircraft").forEach((node) => node.remove());

  aircraftData.forEach((plane) => {
    const button = document.createElement("button");
    button.className = "aircraft";
    button.type = "button";
    button.setAttribute("aria-label", `Aircraft at stand ${plane.stand}`);
    button.dataset.stand = plane.stand;
    button.style.left = `${plane.x}%`;
    button.style.top = `${plane.y}%`;
    button.style.width = `${plane.size}%`;
    button.innerHTML = aircraftSvg(plane.rotation);

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      document
        .querySelectorAll(".aircraft.selected")
        .forEach((node) => node.classList.remove("selected"));

      button.classList.add("selected");
      selectedAircraft.textContent = `Selected stand: ${plane.stand}`;
    });

    aircraftLayer.appendChild(button);
  });
}

renderAircraft();
