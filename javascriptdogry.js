const UNIVERSAL_MULTIPLIER = 1.2;

const SEEDS = {
  tomato:    { label: "Pomidor",     price: 2,     growth: 15,   yield: 1 },
  strawberry:{ label: "Truskawka",   price: 6,     growth: 30,   yield: 1 },
  onion:     { label: "Cebula",      price: 15,    growth: 45,   yield: 1 },
  carrot:    { label: "Marchewka",   price: 50,    growth: 50,   yield: 1 },
  cucumber:  { label: "Ogórek",      price: 140,   growth: 80,   yield: 1 },
  lettuce:   { label: "Sałata",      price: 600,   growth: 130,  yield: 1 },
  blueberry: { label: "Borówka",     price: 1250,  growth: 290,  yield: 1 },
  pepper:    { label: "Papryka",     price: 10000, growth: 420,  yield: 1 },
  pumpkin:   { label: "Dynia",       price: 35000, growth: 680,  yield: 1 },
  corn:      { label: "Kukurydza",   price: 120000,growth: 840,  yield: 1 },
  watermelon:{ label: "Arbuz",       price: 300000,growth: 1300, yield: 1 },
  grape:     { label: "Winogrono",   price: 1000000, growth: 1700, yield: 1 },
  pineapple: { label: "Ananas",      price: 3500000, growth: 3200, yield: 1 },
  dreamfruit:{ label: "Owoc Marzeń", price: 10000000, growth: 3500, yield: 1 },
  greenberry:{ label: "Ziel Jagoda", price: 20000000, growth: 5000, yield: 1 },
  maskfruit: { label: "Maska(Event)",price: 25000000, growth: 6500, yield: 1 }
};

const MUTATIONS = [
  { name: 'big', chance: 1 / 10 },
  { name: 'gold', chance: 1 / 30 },
  { name: 'rainbow', chance: 1 / 100 },
  { name: 'huge', chance: 1 / 250 },
  { name: 'mega', chance: 1 / 500 },
  { name: 'lucky', chance: 1 / 777 },
  { name: 'prismatic', chance: 1 / 800 },
  { name: 'high-powered', chance: 1 / 1000 },
  { name: 'blessed', chance: 1 / 1200 },
  { name: 'glitched', chance: 1 / 2000 }
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
    const btn = document.createElement("button");
    btn.className = "button";
    btn.textContent = `Kup ${label} (💰${price})`;
    btn.onclick = () => buySeed(t);
    shop.appendChild(btn);
  }
}

function renderField() {
  const field = document.getElementById("field"); field.innerHTML = "";
  plots.forEach((plot, i) => {
    const div = document.createElement("div"); div.className = "plot";
    if (!plot) {
      div.textContent = "Puste miejsce";
      for (const t in SEEDS) {
        if (seeds[t] > 0) {
          const btn = document.createElement("button");
          btn.className = "button";
          btn.textContent = `Posadź ${SEEDS[t].label}`;
          btn.onclick = () => plantSeed(i, t);
          div.appendChild(btn);
        }
      }
    } else {
      const elapsed = (Date.now() - plot.planted) / 1000;
      const ready = elapsed >= plot.growth;
      const progress = Math.min(elapsed / plot.growth * 100, 100);
      div.innerHTML = `${SEEDS[plot.type].label}`;
      if (plot.mutations) {
        for (const mut of plot.mutations) {
          div.innerHTML += ` <span class="mut ${mut.replace(/\s/g, '-')}">${mut}</span>`;
        }
      }
      div.innerHTML += `<div class="progress"><div class="progress-inner" style="width:${progress}%"></div></div><p>${ready ? "Gotowe do zbioru!" : `${Math.ceil(plot.growth - elapsed)}s`}</p>`;
      if (ready) {
        const h = document.createElement("button");
        h.className = "button";
        h.textContent = "Zbierz";
        h.onclick = () => harvest(i);
        div.appendChild(h);
      }
    }
    field.appendChild(div);
  });
}

function renderUniversal() {
  const div = document.getElementById("universal"); div.innerHTML = "";
  const hasFruit = Object.values(fruits).some(arr => arr.length > 0);
  if (!hasFruit) { div.textContent = "Brak owoców."; return; }

  for (const t in fruits) {
    const items = fruits[t]; if (items.length === 0) continue;
    const basePrice = SEEDS[t].price * UNIVERSAL_MULTIPLIER;
    let total = items.length * basePrice;
    const line = document.createElement("div");
    line.innerHTML = `${items.length}× ${SEEDS[t].label} za 💰${Math.floor(total)} (łącznie)`;
    const btn = document.createElement("button");
    btn.className = "button";
    btn.textContent = "Sprzedaj";
    btn.onclick = () => { coins += total; fruits[t] = []; renderAll(); };
    line.appendChild(btn);
    div.appendChild(line);
  }
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

let mutBonusLeft = 0;
let mutBonusMultiplier = 1;

function plantSeed(i, t) {
  if (!plots[i] && seeds[t] > 0) {
    seeds[t]--;
    let mutations = [];
    for (const mut of MUTATIONS) {
      const chance = mut.chance * mutBonusMultiplier;
      if (Math.random() < chance) {
        mutations.push(mut.name);
      }
    }
    if (mutBonusLeft > 0) {
      mutBonusLeft--;
      if (mutBonusLeft === 0) mutBonusMultiplier = 1;
    }
    plots[i] = {
      type: t,
      planted: Date.now(),
      growth: SEEDS[t].growth,
      mutations
    };
    renderAll();
  }
}

function harvest(i) {
  const plot = plots[i];
  if (plot && Date.now() - plot.planted >= plot.growth * 1000) {
    fruits[plot.type].push({ mutations: plot.mutations });
    plots[i] = null;
    renderAll();
  }
}

function redeemCode() {
  const code = document.getElementById("reward-code").value.trim().toUpperCase();
  const msg = document.getElementById("reward-message");

  if (code === "KONEWKA123") {
    let count = 0;
    plots.forEach(plot => {
      if (plot && Date.now() - plot.planted < plot.growth * 1000) {
        plot.planted = Date.now() - plot.growth * 1000;
        count++;
      }
    });
    msg.textContent = `✅ Przyspieszono wzrost ${count} roślin.`;
  } else if (code === "MUTACJE2X") {
    mutBonusLeft = 3;
    mutBonusMultiplier = 2;
    msg.textContent = "✅ Następne 3 sadzenia mają 2× większą szansę na mutacje!";
  } else if (code === "MUTACJE3X") {
    mutBonusLeft = 4;
    mutBonusMultiplier = 3;
    msg.textContent = "✅ Następne 4 sadzenia mają 3× większą szansę na mutacje!";
  } else if (code === "XD") {
    msg.textContent = "test";
  } else {
    msg.textContent = "❌ Nieprawidłowy kod.";
  }

  document.getElementById("reward-code").value = "";
}

// ----- ZAPIS I WCZYTYWANIE -----

function saveGame() {
  const data = {
    coins,
    seeds,
    fruits,
    plots,
    mutBonusLeft,
    mutBonusMultiplier
  };
  localStorage.setItem("plant-tycoon-save", JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem("plant-tycoon-save");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    coins = data.coins || 0;
    Object.assign(seeds, data.seeds);
    Object.assign(fruits, data.fruits);
    plots = data.plots || Array(3).fill(null);
    mutBonusLeft = data.mutBonusLeft || 0;
    mutBonusMultiplier = data.mutBonusMultiplier || 1;
  } catch (e) {
    console.error("Błąd wczytywania zapisu:", e);
  }
}

function resetGame() {
  localStorage.removeItem("plant-tycoon-save");
  location.reload();
}

function renderAll() {
  renderEconomy();
  renderField();
  renderShop();
  renderUniversal();
  saveGame();
}

loadGame();
renderAll();
setInterval(renderAll, 1000);