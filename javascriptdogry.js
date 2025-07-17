const UNIVERSAL_MULTIPLIER = 1.1;

const SEEDS = {
  tomato:    { label: "Pomidor",     price: 2,  growth: 15,   yield: 1 },
  strawberry:{ label: "Truskawka",   price: 6,  growth: 30,   yield: 1 },
  onion:     { label: "Cebula",      price: 15, growth: 45,   yield: 1 },
  carrot:    { label: "Marchewka",   price: 50, growth: 50,   yield: 1 },
  cucumber:  { label: "Ogórek",      price: 140, growth: 80,  yield: 1 },
  lettuce:   { label: "Sałata",      price: 600, growth: 130, yield: 1 },
  blueberry: { label: "Borówka",     price: 1250, growth: 290, yield: 1 },
  pepper:    { label: "Papryka",     price: 10000, growth: 420, yield: 1 },
  pumpkin:   { label: "Dynia",       price: 35000, growth: 680, yield: 1 },
  corn:      { label: "Kukurydza",   price: 120000, growth: 840, yield: 1 },
  greenfruit:{ label: "Zielona Jagoda", price: 650000, growth: 1100, yield: 1 },
  darkgrapes:{ label: "Mroczne Winogrona", price: 1700000, growth: 1500, yield: 1 },
  dragonfrt: { label: "Dragon Fruit", price: 10000000, growth: 2400, yield: 1 },
  chewinggum:{ label: "Owoc Gumy do Żucia (EVENT)", price: 120000000, growth: 3600, yield: 1 },
};

const MUTATIONS = [
  { name: 'big', chance: 1/10, multiplier: 2 },
  { name: 'gold', chance: 1/30, multiplier: 4 },
  { name: 'rainbow', chance: 1/100, multiplier: 10 },
  { name: 'huge', chance: 1/250, multiplier: 20 },
  { name: 'glitched', chance: 1/500, multiplier: 35 },
  { name: 'godly', chance: 1/1000, multiplier: 70 }
];

const GROW_CODE = "qawsedrftgyh";
const MULT2_CODE = "azsxdcfvgbhn";
const MULT3_CODE = "qwerty";

let coins = 5;
const seeds = {}, fruits = {};
Object.keys(SEEDS).forEach(k => { seeds[k] = 0; fruits[k] = []; });
let plots = Array(3).fill(null);

function expandField() {
  if (plots.length >= 12) return;
  const cost = plots.length === 3 ? 50 : 150;
  if (coins < cost) {
    alert(`Potrzebujesz ${cost} monet do rozbudowy pola.`);
    return;
  }
  coins -= cost;
  plots = plots.concat(Array(3).fill(null));
  renderAll();
  saveGame();
}

function buySeed(t) {
  const p = SEEDS[t].price;
  if (coins >= p) {
    coins -= p;
    seeds[t]++;
    renderAll();
    saveGame();
  }
}

function plantSeed(i, t) {
  if (!plots[i] && seeds[t] > 0) {
    seeds[t]--;
    let mutations = [];
    for (const mut of MUTATIONS) {
      if (Math.random() < mut.chance) {
        mutations.push(mut.name);
      }
    }
    plots[i] = {
      type: t,
      planted: Date.now(),
      growth: SEEDS[t].growth,
      mutations
    };
    renderAll();
    saveGame();
  }
}

function harvest(i) {
  const plot = plots[i];
  if (!plot) return;
  if (Date.now() - plot.planted < plot.growth * 1000) return;

  fruits[plot.type].push({ mutations: plot.mutations });
  plots[i] = null;
  renderAll();
  saveGame();
}

function renderEconomy() {
  document.getElementById("coins").textContent = coins.toFixed(2) + " (" + coins.toExponential(2) + ")";
  const sDiv = document.getElementById("seeds"); sDiv.innerHTML = "";
  for (const t in seeds) {
    sDiv.innerHTML += `<p>${SEEDS[t].label}: ${seeds[t]}</p>`;
  }
  const fDiv = document.getElementById("fruits"); fDiv.innerHTML = "";
  for (const t in fruits) {
    if (fruits[t].length)
      fDiv.innerHTML += `<p>${SEEDS[t].label}: ${fruits[t].length}</p>`;
  }
}

function renderShop() {
  const shop = document.getElementById("shop"); shop.innerHTML = "";
  for (const t in SEEDS) {
    const { label, price } = SEEDS[t];
    shop.innerHTML += `<button class="button shopBut" onclick="buySeed('${t}')">Kup ${label} (${price})</button>`;
  }
}

function renderField() {
  const field = document.getElementById("field"); field.innerHTML = "";
  plots.forEach((plot, i) => {
    const div = document.createElement("div");
    div.className = "plot";
    if (!plot) {
      div.innerHTML = "Puste miejsce<br/>";
      for (const t in SEEDS) {
        if (seeds[t] > 0) {
          div.innerHTML += `<button class="button" onclick="plantSeed(${i}, '${t}')">Posadź ${SEEDS[t].label}</button>`;
        }
      }
    } else {
      const elapsed = (Date.now() - plot.planted) / 1000;
      const ready = elapsed >= plot.growth;
      const progress = Math.min(elapsed / plot.growth * 100, 100);
      div.innerHTML = `<b>${SEEDS[plot.type].label}</b>`;
      if (plot.mutations.length) {
        for (const mut of plot.mutations) {
          div.innerHTML += ` <span class="mut">${mut}</span>`;
        }
      }
      div.innerHTML += `<div class="progress"><div class="progress-inner" style="width:${progress}%"></div></div>`;
      div.innerHTML += `<p>${ready ? "Gotowe do zbioru!" : `${Math.ceil(plot.growth - elapsed)}s`}</p>`;
      if (ready) {
        div.innerHTML += `<button class="button" onclick="harvest(${i})">Zbierz</button>`;
      }
    }
    field.appendChild(div);
  });
}

function renderUniversal() {
  const div = document.getElementById("universal"); div.innerHTML = "";
  for (const t in fruits) {
    const items = fruits[t]; if (items.length === 0) continue;
    const basePrice = SEEDS[t].price * UNIVERSAL_MULTIPLIER;
    let total = 0;
    for (const fruit of items) {
      let price = basePrice;
      for (const mut of fruit.mutations) {
        const mult = MUTATIONS.find(m => m.name === mut)?.multiplier || 1;
        price *= mult;
      }
      total += price;
    }
    div.innerHTML += `<div>${items.length}× ${SEEDS[t].label} za ${Math.floor(total)} <button class="button" onclick="sellFruit('${t}', ${total})">Sprzedaj</button></div>`;
  }
}

function sellFruit(t, total) {
  coins += total;
  fruits[t] = [];
  renderAll();
  saveGame();
}

function useCode() {
  const code = document.getElementById("codeInput").value.trim().toLowerCase();

  if (code === GROW_CODE) {
    if (localStorage.getItem("used-" + GROW_CODE)) {
      alert("Ten kod już został użyty.");
    } else {
      for (let i = 0; i < plots.length; i++) {
        if (plots[i]) {
          plots[i].planted = Date.now() - plots[i].growth * 1000;
        }
      }
      localStorage.setItem("used-" + GROW_CODE, "true");
      alert("Kod aktywowany: Wszystkie rośliny gotowe do zbioru!");
    }
  }

  else if (code === MULT2_CODE) {
    if (localStorage.getItem("used-" + MULT2_CODE)) {
      alert("Ten kod już został użyty.");
    } else {
      MUTATIONS.forEach(m => m.chance *= 2);
      localStorage.setItem("used-" + MULT2_CODE, "true");
      alert("Kod aktywowany: Mutacje mają 2x większą szansę!");
    }
  }

  else if (code === MULT3_CODE) {
    if (localStorage.getItem("used-" + MULT3_CODE)) {
      alert("Ten kod już został użyty.");
    } else {
      MUTATIONS.forEach(m => m.chance *= 3);
      localStorage.setItem("used-" + MULT3_CODE, "true");
      alert("Kod aktywowany: Mutacje mają 3x większą szansę!");
    }
  }

  else {
    alert("Nieprawidłowy kod.");
  }

  document.getElementById("codeInput").value = "";
  renderAll();
  saveGame();
}

function saveGame() {
  const data = { coins, seeds, fruits, plots };
  localStorage.setItem("plant-tycoon-save", JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem("plant-tycoon-save");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    coins = data.coins || 5;
    Object.assign(seeds, data.seeds);
    Object.assign(fruits, data.fruits);
    plots = data.plots || Array(3).fill(null);
  } catch (e) {
    console.error("Błąd wczytywania zapisu:", e);
  }
}

function resetGame() {
  localStorage.removeItem("plant-tycoon-save");
  localStorage.removeItem("used-" + GROW_CODE);
  localStorage.removeItem("used-" + MULT2_CODE);
  localStorage.removeItem("used-" + MULT3_CODE);
  location.reload();
}

function renderAll() {
  renderEconomy();
  renderShop();
  renderField();
  renderUniversal();
}

loadGame();
renderAll();
setInterval(renderAll, 1000);