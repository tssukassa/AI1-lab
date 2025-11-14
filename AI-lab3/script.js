const mapEl = document.getElementById('map');
const locBtn = document.getElementById('locBtn');
const exportBtn = document.getElementById('exportBtn');
const coordsEl = document.getElementById('coords');
const boardEl = document.getElementById('board');
const stolEl = document.getElementById('stol');

let map, userMarker;
let tiles = [];
let placed = 0;

// -------------------------------------------------------------
// MAPA — SATELITARNA
// -------------------------------------------------------------
function initMap() {
  map = L.map('map').setView([52.2297, 21.0122], 16);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles © Esri — World Imagery"
    }
  ).addTo(map);
}

// -------------------------------------------------------------
// POWIADOMIENIA
// -------------------------------------------------------------
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// -------------------------------------------------------------
// GEOLOKALIZACJA
// -------------------------------------------------------------
locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported.');

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;
      coordsEl.textContent = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;

      if (userMarker) userMarker.remove();
      userMarker = L.marker([latitude, longitude]).addTo(map);

      map.setView([latitude, longitude], 17);
    },
    (err) => alert("Error: " + err.message),
    { enableHighAccuracy: true }
  );
});

// -------------------------------------------------------------
// POBIERANIE MAPY I GENEROWANIE PUZZLI
// -------------------------------------------------------------
exportBtn.addEventListener('click', () => {
  exportBtn.disabled = true;
  exportBtn.textContent = "Saving..";

  leafletImage(map, (err, canvas) => {
    if (err) {
      alert("Error: " + err);
      return resetExportBtn();
    }

    const preview = document.getElementById("canvasPreview");
    preview.replaceChildren(canvas);

    canvas.style.width = "100%";
    canvas.style.borderRadius = "12px";

    splitImageToTiles(canvas, 4, 4);
    resetExportBtn();
  });
});

function resetExportBtn() {
  exportBtn.disabled = false;
  exportBtn.textContent = "Get map";
}

// -------------------------------------------------------------
// TWORZENIE PUZZLI
// -------------------------------------------------------------
function splitImageToTiles(sourceCanvas, cols, rows) {
  tiles = [];
  placed = 0;
  boardEl.innerHTML = "";
  stolEl.innerHTML = "";

  const w = Math.floor(sourceCanvas.width / cols);
  const h = Math.floor(sourceCanvas.height / rows);

  // Generowanie płytek
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      const temp = document.createElement("canvas");
      temp.width = w;
      temp.height = h;

      temp.getContext("2d").drawImage(
        sourceCanvas,
        c * w, r * h, w, h,
        0, 0, w, h
      );

      tiles.push({
        index: r * cols + c,
        dataURL: temp.toDataURL("image/png")
      });
    }
  }

  // Puste kratki planszy
  tiles.forEach((_, i) => {
    const cell = createCell(i);
    boardEl.appendChild(cell);
  });

  // Tasowanie puzzli
  shuffleArray(tiles).forEach(t => {
    stolEl.appendChild(createDraggableTile(t));
  });
}

function createCell(i) {
  const cell = document.createElement('div');
  cell.className = "cell";
  cell.dataset.correct = i;
  cell.addEventListener("dragover", e => e.preventDefault());
  cell.addEventListener("drop", onDropCell);
  return cell;
}

function createDraggableTile(t) {
  const img = document.createElement("img");
  img.src = t.dataURL;
  img.dataset.index = t.index;
  img.className = "draggableTile";
  img.draggable = true;
  img.addEventListener("dragstart", onDragStart);
  return img;
}

// -------------------------------------------------------------
// DRAG & DROP
// -------------------------------------------------------------
function onDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.index);
}

function onDropCell(e) {
  e.preventDefault();
  const index = e.dataTransfer.getData("text/plain");
  const cell = e.currentTarget;

  if (cell.dataset.occupied === "1") return;

  const img = stolEl.querySelector(`img[data-index='${index}']`);
  if (!img) return;

  const clone = img.cloneNode();
  clone.className = "tile";
  clone.draggable = false;
  clone.addEventListener("click", onTileRemove);

  cell.appendChild(clone);
  img.remove();
  cell.dataset.occupied = "1";

  if (index == cell.dataset.correct) {
    cell.classList.add("correct");
    placed++;
  }

  checkWin();
}

function onTileRemove(e) {
  const img = e.currentTarget;
  const cell = img.parentElement;
  const index = img.dataset.index;

  img.remove();
  cell.dataset.occupied = "";

  if (index == cell.dataset.correct) {
    cell.classList.remove("correct");
    placed--;
  }

  stolEl.appendChild(createDraggableTile(tiles[index]));
}

function checkWin() {
  if (placed === tiles.length) showNotification("Success!", "You've done it right.");
}

// -------------------------------------------------------------
// POWIADOMIENIA
// -------------------------------------------------------------
/*function showNotification(title, message) {
  if (!("Notification" in window))
    return alert(title + "\n" + message);

  if (Notification.permission === "granted")
    return new Notification(title, { body: message });

  if (Notification.permission === "default") {
    return Notification.requestPermission().then(p =>
      p === "granted"
        ? new Notification(title, { body: message })
        : alert(title + "\n" + message)
    );
  }

  alert(title + "\n" + message);
}*/

function showNotification(title, message) {
  const fullMsg = `${title}: ${message}`;
  console.log(fullMsg); // ← логируем ВСЕГДА

  if (!("Notification" in window)) {
    alert(fullMsg);
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then(p => {
      if (p === "granted") {
        new Notification(title, { body: message });
      } else {
        alert(fullMsg);
      }
    });
    return;
  }

  // permission === "denied"
  alert(fullMsg);
}


// -------------------------------------------------------------
// UTILS
// -------------------------------------------------------------
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------------------------------------------------
initMap();
requestNotificationPermission();
