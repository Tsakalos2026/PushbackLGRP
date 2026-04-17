const aircraftLayer = document.getElementById("aircraft-layer");
const selectedAircraft = document.getElementById("selected-aircraft");

const topRow = [
  { stand: "G1", x: 41.5, y: 31.0, rotation: 18 },
  { stand: "16", x: 51.5, y: 31.0, rotation: 18 },
  { stand: "15", x: 58.5, y: 31.0, rotation: 18 },
  { stand: "14", x: 65.0, y: 31.0, rotation: 18 },
  { stand: "13", x: 71.5, y: 31.0, rotation: 18 }
];

const bottomRow = [
  { stand: "1A", x: 19.0, y: 69.0, rotation: 180 },
  { stand: "1B", x: 24.3, y: 69.0, rotation: 180 },
  { stand: "2", x: 29.3, y: 69.0, rotation: 180 },
  { stand: "2A", x: 34.1, y: 69.0, rotation: 180 },
  { stand: "2B", x: 39.2, y: 69.0, rotation: 180 },
  { stand: "4", x: 46.0, y: 70.2, rotation: 180 },
  { stand: "5", x: 51.0, y: 70.2, rotation: 180 },
  { stand: "6", x: 56.0, y: 70.2, rotation: 180 },
  { stand: "7", x: 61.0, y: 70.2, rotation: 180 },
  { stand: "8", x: 68.0, y: 70.2, rotation: 180 },
  { stand: "9", x: 73.0, y: 70.2, rotation: 180 },
  { stand: "10", x: 78.0, y: 70.2, rotation: 180 },
  { stand: "11", x: 83.0, y: 70.2, rotation: 180 },
  { stand: "12A", x: 88.5, y: 70.2, rotation: 180 }
];

const aircraftData = [...topRow, ...bottomRow];

function aircraftSvg(rotation) {
  return `
    <svg viewBox="0 0 100 100" style="transform: rotate(${rotation}deg)">
      <path d="M54 6
               L46 6
               L43 32
               L19 42
               L19 49
               L42 46
               L42 59
               L27 66
               L27 72
               L42 69
               L46 95
               L54 95
               L58 69
               L73 72
               L73 66
               L58 59
               L58 46
               L81 49
               L81 42
               L57 32
               Z"></path>
    </svg>
  `;
}

function renderAircraft() {
  aircraftLayer.innerHTML = "";

  aircraftData.forEach((plane) => {
    const button = document.createElement("button");
    button.className = "aircraft";
    button.style.left = `${plane.x}%`;
    button.style.top = `${plane.y}%`;
    button.dataset.stand = plane.stand;
    button.innerHTML = aircraftSvg(plane.rotation);

    button.addEventListener("click", () => {
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
