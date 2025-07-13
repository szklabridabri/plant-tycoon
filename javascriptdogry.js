const UNIVERSAL_MULTIPLIER = 1.2;

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
  corn:      { label: "Kukurydza",   price: 120000, growth: 840, yield: 1 }
};

const MUTATIONS = [
  { name: 'big', chance: 1/10, multiplier: 2 },
  { name: 'gold', chance: 1/30, multiplier: 4 },
  { name: 'rainbow', chance: 1/100, multiplier: 10 },
  { name: 'huge', chance: 1/250, multiplier: 20 },
  { name: 'maska', chance: 1/300, multiplier: 25 }
];

let coins = 5;
const seeds = {}, fruits = {};
Object.keys(SEEDS).forEach(k => { seeds[k] = 0; fruits[k] = []; });
let plots = Array(3).fill(null);

function expandField() {
  if (plots.length >= 9) return;
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
  document.getElementById("coins").textContent = coins.toFixed(2);
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
    shop.innerHTML += `<button class="button" onclick="buySeed('${t}')">Kup ${label} (💰${price})</button>`;
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
    div.innerHTML += `<div>${items.length}× ${SEEDS[t].label} za 💰${Math.floor(total)} <button class="button" onclick="sellFruit('${t}', ${total})">Sprzedaj</button></div>`;
  }
}

function sellFruit(t, total) {
  coins += total;
  fruits[t] = [];
  renderAll();
  saveGame();
}

let code1 = "konewka123";
let code2 = "mnoznik2x";
let code3 = "mnoznik3x";

function useCode() {
  const codeEl = document.getElementById("codeInput");
  const code = codeEl.value.trim().toLowerCase();

  if (code === code1) {
    for (let i = 0; i < plots.length; i++) {
      if (plots[i]) {
        plots[i].planted = Date.now() - plots[i].growth * 1000;
      }
    }
    alert("Kod aktywowany: Wszystkie rośliny natychmiast dojrzały!");
    code1 = "hshdhdhdjsj";
    renderAll();
    saveGame();
    return;
  }

  if (code === code2 || code === code2) {
    if (localStorage.getItem("used-mult2x")) {
      alert("Ten kod już został użyty.");
    } else {
      MUTATIONS.forEach(m => m.chance *= 2);
      localStorage.setItem("used-mult2x", "true");
      alert("Kod aktywowany: Mutacje mają 2x większą szansę!");
      code2 = "jdjdhdhwj"
    }
    renderAll();
    saveGame();
    return;
  }

  if (code === code3 || code === code3) {
    if (localStorage.getItem("used-mult3x")) {
      alert("Ten kod już został użyty.");
    } else {
      MUTATIONS.forEach(m => m.chance *= 3);
      localStorage.setItem("used-mult3x", "true");
      alert("Kod aktywowany: Mutacje mają 3x większą szansę!");
      code3 = "djudhdhsjdisuwhs";
    }
    renderAll();
    saveGame();
    return;
  }

  alert("Nieprawidłowy kod.");
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
  localStorage.removeItem("used-mult2x");
  localStorage.removeItem("used-mult3x");
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