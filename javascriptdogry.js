
    const UNIVERSAL_MULTIPLIER = 1.2;

    const SEEDS = {
      tomato:    { label: "Pomidor",     price: 2,  growth: 15,   yield: 1 },
      strawberry:{ label: "Truskawka",   price: 6,  growth: 30,   yield: 1 },
      onion:     { label: "Cebula",      price: 15,  growth: 45,  yield: 1 },
      carrot:    { label: "Marchewka",   price: 50,  growth: 50,  yield: 1 },
      cucumber:  { label: "Ogórek",      price: 140, growth: 80,  yield: 1 },
      lettuce:   { label: "Sałata",      price: 600,  growth: 130,  yield: 1 },
      blueberry: { label: "Borówka",     price: 1250, growth: 290,  yield: 2 },
      pepper:    { label: "Papryka",     price: 10000, growth: 420, yield: 2 },
      pumpkin:   { label: "Dynia",       price: 35000, growth: 680, yield: 3 },
      corn:      { label: "Kukurydza",   price: 120000, growth: 840, yield: 3 },
      watermelon:{ label: "Arbuz",       price: 300000, growth: 1300, yield: 4 },
      grape:     { label: "Winogrono",   price: 100000, growth: 1700, yield: 4 },
      pineapple: { label: "Ananas",      price: 350000, growth: 3200, yield: 4 }
    };

    const MUTATIONS = [
      { name: 'big', chance: 1 / 10, multiplier: 2 },
      { name: 'gold', chance: 1 / 30, multiplier: 4 },
      { name: 'doubled', chance: 1 / 80, multiplier: 5 },
      { name: 'rainbow', chance: 1 / 100, multiplier: 10 },
      { name: 'huge', chance: 1 / 250, multiplier: 20 },
      { name: 'mega', chance: 1 / 500, multiplier: 30 },
      { name: 'lucky', chance: 1 / 777, multiplier: 50 },
      { name: 'prismatic', chance: 1 / 800, multiplier: 60 },
      { name: 'high-powered', chance: 1 / 1000, multiplier: 100 },
      { name: 'blessed', chance: 1 / 1200, multiplier: 150 }
    ];

    let coins = 5;
    const seeds = {}, fruits = {};
    Object.keys(SEEDS).forEach(k => { seeds[k] = 0; fruits[k] = []; });
    let plots = Array(3).fill(null); // Start z 3 miejscami

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
        const btn = document.createElement("button"); btn.className = "button";
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
          } else if (Date.now() < plot.cancelUntil) {
            const c = document.createElement("button");
            c.className = "button";
            c.textContent = "Anuluj";
            c.onclick = () => cancelPlant(i);
            div.appendChild(c);
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
        let total = 0;
        for (const fruit of items) {
          let price = basePrice;
          for (const mut of fruit.mutations) {
            const mult = MUTATIONS.find(m => m.name === mut)?.multiplier || 1;
            price *= mult;
          }
          total += price;
        }
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


    function plantSeed(i, t) {
      if (!plots[i] && seeds[t] > 0) {
        seeds[t]--;
        let mutations = [];
        for (const mut of MUTATIONS) {
          if (Math.random() < mut.chance) mutations.push(mut.name);
        }
        plots[i] = {
          type: t,
          planted: Date.now(),
          growth: SEEDS[t].growth,
          cancelUntil: Date.now() + 3000,
          mutations
        };
        renderAll();
      }
    }

    function cancelPlant(i) {
      const plot = plots[i];
      if (plot && Date.now() < plot.cancelUntil) {
        seeds[plot.type]++;
        plots[i] = null;
        renderAll();
      }
    }

    function harvest(i) {
      const plot = plots[i];
      if (plot && Date.now() - plot.planted >= plot.growth * 1000) {
        let amount = SEEDS[plot.type].yield || 1;
        if (plot.mutations.includes('doubled')) amount *= 2;
        if (plot.mutations.includes('big')) amount += 1;
        if (plot.mutations.includes('huge')) amount += 2;
        for (let j = 0; j < amount; j++) {
          fruits[plot.type].push({ mutations: [...plot.mutations] });
        }
        plots[i] = null;
        renderAll();
      }
    }

    

    setInterval(renderAll, 1000);

    // ---- ZAPIS / ODCZYT STANU GRY ----
    function saveGame() {
      const data = {
        coins,
        seeds,
        fruits,
        plots
      };
      localStorage.setItem("plant-tycoon-save", JSON.stringify(data));
    }

    function loadGame() {
      const raw = localStorage.getItem("plant-tycoon-save");
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        coins = data.coins || 50;
        Object.assign(seeds, data.seeds);
        Object.assign(fruits, data.fruits);
        plots = data.plots || Array(3).fill(null);
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
      saveGame(); // ← dodaj to
    }
    
    loadGame();
    renderAll();
    setInterval(renderAll, 1000);