const root = document.getElementById('app-root');
const STATE = {
  currentPlayer: 'p1', // 'p1' o 'p2'
  p1: {name:'Jugador 1', warriors:[]},
  p2: {name:'Jugador 2', warriors:[]},
  diceRolled: false, // si ya tiró el dado este turno
  movesLeft: 0,
  selected: null, // pieza seleccionada {r, c, owner}
  board: null, // 10x8 grid
  coinWinner: 0, // 0 para p1, 1 para p2
  placingPlayer: 'p1', // Añadido para seguir la fase de colocación
  mode: null, // 'cpu' o 'pvp'
  turn: 0 // 0 para p1, 1 para p2
};

// crea 20 guerreros
function createWarriors(){
  const types=[
    {name:'Arquero de Fuego', range:2, damage:12, desc:'Ataque a distancia con flechas en llamas', img:'imagenes/arquero de fuego3.jpeg'},
    {name:'Vikingo Espadachín', range:1, damage:15, desc:'Cuerpo a cuerpo con gran fuerza', img:'imagenes/vikingo espadachin3.jpeg'},
    {name:'Jinete', range:1, damage:15, desc:'Movimiento rápido a caballo', img:'imagenes/jinete3.jpeg'},
    {name:'Jinete Arquero', range:2, damage:13, desc:'Tiro a distancia montado', img:'imagenes/jinete arquero3.jpeg'},
    {name:'Mago Violeta', range:2, damage:14, desc:'Bola de magia violeta', img:'imagenes/mago violeta3.jpeg'},
    {name:'Lanceros', range:2, damage:13, desc:'Lanza de alcance medio', img:'imagenes/lancero3.jpeg'},
    {name:'Vikingo Hachero', range:1, damage:17, desc:'Hachas dobles cuerpo a cuerpo', img:'imagenes/vikingo hachero3.jpeg'},
    {name:'Dama Cuchillera', range:1, damage:18, desc:'Ataque cuerpo a cuerpo rápido', img:'imagenes/dama cuchillera3.jpeg'},
    {name:'Mujer Pistolera', range:2, damage:20, desc:'Ataques a distancia potentes', img:'imagenes/mujer pistolera3.jpeg'},
    {name:'Ballestero', range:2, damage:13, desc:'Ballesta desde dos casillas', img:'imagenes/ballestero3.jpeg'},
    {name:'Caballero', range:1, damage:15, desc:'Armadura y espada potente', img:'imagenes/caballero3.jpeg'},
    {name:'Guardia', range:1, damage:13, desc:'Escudo defensivo', img:'imagenes/guardia3.jpeg'},
    {name:'Berserker', range:1, damage:17, desc:'Ataque brutal cuerpo a cuerpo', img:'imagenes/berserker3.jpeg'},
    {name:'Hechicero', range:2, damage:14, desc:'Hechizos de daño', img:'imagenes/hechicero3.jpeg'},
    {name:'Lancero Pesado', range:2, damage:15, desc:'Lanza con alcance', img:'imagenes/lancero pesado3.jpeg'},
    {name:'Scout', range:1, damage:12, desc:'Rápido y esquivo', img:'imagenes/scaut3.jpeg'},
    {name:'Heraldo', range:1, damage:12, desc:'Apoyo y moral', img:'imagenes/heraldo3.jpeg'},
    {name:'Alquimista', range:2, damage:13, desc:'Bombas arcanas', img:'imagenes/alquimista3.jpeg'},
    {name:'Monje Guerrero', range:1, damage:15, desc:'Combate cuerpo a cuerpo con disciplina', img:'imagenes/monje guerrero3.jpeg'},
    {name:'Artillero', range:2, damage:20, desc:'Armas de fuego antiguas', img:'imagenes/artillero3.jpeg'}
  ];
  return types.map((t,i)=>({
    id:i, name:t.name, range:t.range, damage:t.damage, energy:100, img: t.img, desc: t.desc
  }));
}
STATE.warriors = createWarriors();

// --- FUNCION AÑADIDA PARA SOLUCIONAR EL ERROR DE TABLERO INVISIBLE ---
function placeRocks(){
  // Queremos 10 rocas distribuidas en las filas centrales (2 a 7), lejos de las zonas de colocación iniciales (0, 1, 8, 9)
  const eligibleSpots = [];
  // Las filas centrales son 2, 3, 4, 5, 6, 7 (6 filas)
  for (let r = 2; r <= 7; r++) {
    for (let c = 0; c < 8; c++) {
      eligibleSpots.push([r, c]);
    }
  }

  // Barajar los puntos elegibles
  eligibleSpots.sort(() => 0.5 - Math.random());

  // Colocar las primeras 10 rocas
  const numRocks = 10;
  for (let i = 0; i < Math.min(numRocks, eligibleSpots.length); i++) {
    const [r, c] = eligibleSpots[i];
    // Chequeo de seguridad, aunque con el método de barajar no debería haber nulls en el board aún
    if (STATE.board[r][c] === null) {
      STATE.board[r][c] = { type: 'rock' };
    }
  }
}
// -----------------------------------------------------------------



// ------- renderiza la pantalla

// Tu función showSplash modificada
window.showSplash = function() {

  root.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'splash';
  
  el.innerHTML = `
    <canvas id="particles"></canvas>
    <div class="splash-content">
      <h1 class="title">Galactic War²</h1>
      <h2> - Warriors of the Cosmos - </h2>
      <div class="loader">
        <div class="bar" id="loadbar"></div>
        <div class="percent" id="percentText">0%</div>
      </div>
      <button class="start-btn" id="startBtn" style="display:none;">Iniciar</button>
    </div>
  `;
  root.appendChild(el);

  // --- 🎧 SONIDO FUTURISTA DE FONDO ---
  const bgSound = new Audio('sonido/internal-turbulence-of-spacecraft-fnx-sound-290552.mp3'); // Ajusta la ruta o nombre del archivo
  bgSound.loop = true;
  bgSound.volume = 0.5;

  // --- Fondo animado ---
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const numParticles = 80;
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 2 + 1
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- Barra de carga ---
  const bar = document.getElementById('loadbar');
  const percentText = document.getElementById('percentText');

  let progress = 0;
  const duration = 3000;
  const interval = 30;
  const step = interval / duration * 100;

  const timer = setInterval(() => {
    progress += step;
    if (progress >= 100) progress = 100;
    bar.style.width = progress + '%';
    percentText.innerText = Math.floor(progress) + '%';
    if (progress >= 100) {
      clearInterval(timer);
      document.getElementById('startBtn').style.display = 'inline-block';
    }
  }, interval);

  // --- 🎮 Botón "Iniciar" ---
  document.getElementById('startBtn').addEventListener('click', () => {
    bgSound.play(); // 🔊 El sonido arranca AQUÍ
    showMenu(bgSound); // 🔁 Pasamos la referencia para poder detenerlo luego
  });
}

// ----------------------------------------------------------

function showMenu(bgSound) {
  root.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'menu-screen';
  div.innerHTML = `
    <canvas id="menuParticles"></canvas>
    <div class="menu-content">
      <h2 class="menu-title">⚔️ Galactic War² ⚔️</h2>
      <h2> - Warriors of the Cosmos - </h2>
      <p class="menu-sub">Elige modo de juego</p>
      <div class="controls">
        <button class="btn neon" id="btnCPU">1P vs CPU</button>
        <button class="btn neon" id="btnPVP">1P vs 2P</button>
        <button class="btn ghost" id="btnExit">Salir</button>
      </div>
    </div>
  `;
  root.appendChild(div);

  // --- Detener sonido al elegir una opción ---
  const stopSound = () => {
    if (bgSound) {
      bgSound.pause();
      bgSound.currentTime = 0;
    }
  };

  document.getElementById('btnCPU').addEventListener('click', () => {
    stopSound();
    STATE.mode = 'cpu';
    showSetup('cpu');
  });

  document.getElementById('btnPVP').addEventListener('click', () => {
    stopSound();
    STATE.mode = 'pvp';
    showSetup('pvp');
  });

  document.getElementById('btnExit').addEventListener('click', () => {
    stopSound();
    showSplash(); // 🔁 Vuelve correctamente al inicio
  });

  // --- Fondo animado del menú ---
  const canvas = document.getElementById('menuParticles');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const num = 80;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < num; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 2 + 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}



function showSetup(mode){
  root.innerHTML='';
  const wrapper=document.createElement('div');
  wrapper.className='setup futuristic-setup'; // 👈 clase extra
  wrapper.innerHTML = `
    <div class="card glow">
        <h3>Ingresa tu Alias</h3>
      <input class="input neon-input" id="p1name" placeholder="Nombre jugador 1" value="${STATE.p1.name}" />
      <div class="ready-row"><br><br><br><button class="btn neon-btn" id="p1ready">Listo</button></div>
      <input type="hidden" id="diceSound" src="sonido/dados.mp3" preload="auto">
    </div>
    <div class="card glow" id="secondCard"></div>
  `;
  root.appendChild(wrapper);

  document.getElementById('p1ready').addEventListener('click',()=>{
    const name = document.getElementById('p1name').value.trim() || 'Player1';
    STATE.p1.name=name;
    if(mode==='cpu') showCPUReady(); else showP2Name();
  });
}

function showCPUReady(){
  const second = document.getElementById('secondCard');
  second.innerHTML='';
  const div = document.createElement('div');
  div.innerHTML = `
    <h3>CPU</h3>
    <p>Nombre de la CPU se asignará aleatoriamente</p>
    <div class="ready-row"><button class="btn neon-btn" id="cpuReady">Listo</button></div>
  `;
  second.appendChild(div);

  document.getElementById('cpuReady').addEventListener('click',()=>{
    STATE.p2.name = ['Mordred','Ragnar','Balin','Hrodgar','Sandre','Stu'][Math.floor(Math.random()*4)];
    showCoinFlipWrapper(); // 👈 pasa a la moneda
  });
}

function showP2Name(){
  const second = document.getElementById('secondCard');
  second.innerHTML = `
    <h3>Ingresa tu Alias</h3>
    <input class="input neon-input" id="p2name" placeholder="Nombre jugador 2" value="${STATE.p2.name}" />
    <div class="ready-row"><br><br><br><button class="btn neon-btn" id="p2ready">Listo</button></div>
  `;
  document.getElementById('p2ready').addEventListener('click',()=>{
    STATE.p2.name = document.getElementById('p2name').value.trim() || 'Player2';
    showCoinFlipWrapper();
  });
}


// 🎯 Funcióm que muestra la pantalla de la moneda (WRAPPER)
function showCoinFlipWrapper(){
  root.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'menu futuristic-coin'; // 👈 clase extra para los efectos visuales
  div.innerHTML = `
    <h2>🪙 Sorteo para determinar quién empieza</h2>
    <p>Haz clic en la moneda para lanzarla.</p>
    <div id="coinArea" class="coin-area"></div>
    <p style="margin-top:20px; font-size:14px;">El ganador del sorteo empezará primero a colocar sus unidades en el tablero.</p>
  `;
  root.appendChild(div);
  
  setupCoinArea();
}

// ** FUNCIÓN CORREGIDA **
function finalizeCoinWinner(){
  // Asignar automáticamente guerreros a ambos jugadores (Simplificado)
  
  // Barajar una copia del guerreros COMPLETA del STATE
  const pool = [...STATE.warriors];
  pool.sort(() => 0.5 - Math.random());

  // P1: 6 guerreros (owner: 0) - Se usa .slice() para obtener una COPIA del subconjunto
  // y luego se mapea para asegurar que los objetos de p1 y p2 sean distintos en memoria
  // y tengan el 'owner' y 'energy' correctos.
  STATE.p1.warriors = pool.slice(0,6).map(w=>({...w, owner: 0, energy: 100}));

  // P2: Los siguientes 6 guerreros (owner: 1)
  STATE.p2.warriors = pool.slice(6,12).map(w=>({...w, owner: 1, energy: 100}));

  // Continuar directo al tablero de Colocación
  showPlacementScreen();
}
// ** FIN FUNCIÓN CORREGIDA **

function setupCoinArea() {
    const el = document.getElementById('coinArea');
    el.innerHTML = '';

    // 🔊 Precargar sonido
    const coinSound = document.createElement('audio');
    coinSound.id = 'coinSound';
    coinSound.src = 'sonido/moneda2.mp3';
    coinSound.preload = 'auto';
    el.appendChild(coinSound);

    // 🪙 Crear moneda
    const coin = document.createElement('div');
    coin.className = 'coin';
    const inner = document.createElement('div');
    inner.className = 'coin-inner';

 
    inner.innerHTML = `
    <div class="coin-face front" style="background-image: url('imagenes/moneda1.jpg');">
    </div>
    <div class="coin-face back" style="background-image: url('imagenes/moneda2.jpg'); transform: rotateY(180deg);">
    </div>
    `;
   

    coin.appendChild(inner);
    el.appendChild(coin);

    // 🩵 Asegurar que sea clickeable
    coin.style.pointerEvents = 'auto';
    coin.style.cursor = 'pointer';
    coin.style.zIndex = '1000';

    coin.addEventListener('click', () => {
        // Evitar doble click
        if (inner.classList.contains('flip3D')) return;

        // Reproducir sonido
        const soundEl = document.getElementById('coinSound');
        if (soundEl) {
            soundEl.currentTime = 0;
            soundEl.play().catch(() => {}); // Evitar error si no hay interacción previa
        }

        // 💫 Determinar ganador
        let result = 'B';
        if (STATE.mode === 'cpu') {
            result = 'A'; // fuerza que gane P1 si es vs CPU
        } else {
            result = Math.random() < 0.5 ? 'A' : 'B';
        }

        // Iniciar animación
        inner.classList.add('flip3D');

        setTimeout(() => {
            const finalRotation = result === 'A' ? 'rotateY(0deg)' : 'rotateY(180deg)';
            inner.style.transform = finalRotation;
            inner.classList.remove('flip3D');

            STATE.coinWinner = result === 'A' ? 0 : 1;
            const winner = STATE.coinWinner === 0 ? STATE.p1.name : STATE.p2.name;

            // 🏆 Mostrar resultado
            const banner = document.createElement('div');
            banner.className = 'coin-result-banner';
            banner.innerHTML = `<h2>🪙 Ganador del sorteo: ${winner}</h2>`;
            el.appendChild(banner);

            // Continuar luego de 2 segundos
            setTimeout(() => {
                el.innerHTML = '';
                finalizeCoinWinner();
            }, 2000);
        }, 1600);
    });
}


// Placement screen
function showPlacementScreen(){
  root.innerHTML='';
  // Inicializar el tablero por primera vez si es necesario
  if(!STATE.board) {
    STATE.board = Array.from({ length: 10 }, () => Array.from({ length: 8 }, () => null));
    placeRocks(); // <--- AHORA LLAMA A LA FUNCIÓN EXISTENTE
  }
  
  const wrap = document.createElement('div'); wrap.className='board-wrap';
  const boardDiv = document.createElement('div'); boardDiv.className='board'; boardDiv.id='board';
  
  // Construye el tablero visual
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      if (window.innerWidth < 900) cell.classList.add('small');
      cell.addEventListener('click', () => onCellClickPlace(r, c, cell));
      boardDiv.appendChild(cell);
    }
  }

  const side = document.createElement('div'); side.className='side-panel';
  side.innerHTML = `<h3>Coloca tus guerreros</h3><div id='roster'></div><div style='margin-top:12px'><button class='btn' id='doneBtn'>Listo</button></div>`;
  wrap.appendChild(boardDiv); wrap.appendChild(side); root.appendChild(wrap);
  
  // El jugador que ganó la moneda (STATE.coinWinner) coloca primero
  STATE.placingPlayer = STATE.coinWinner === 0 ? 'p1' : 'p2';
  
  updatePlacementSidePanel();
  renderBoard(); // Dibuja las rocas y las celdas
}

function updatePlacementSidePanel() {
  const isP1Turn = STATE.placingPlayer === 'p1';
  const player = isP1Turn ? STATE.p1 : STATE.p2;
  const side = root.querySelector('.side-panel');
  
  side.innerHTML = `
    <h3>${player.name} - Coloca tus guerreros</h3>
    <div id='roster'></div>
    <div style='margin-top:12px'>
      <button class='btn' id='doneBtn'>Listo</button>
    </div>
  `;
  renderRoster(STATE.placingPlayer);
  const doneBtn = document.getElementById('doneBtn');
  doneBtn.addEventListener('click', handleDonePlacement);
  
  // Si es CPU, auto-colocar inmediatamente si es su turno.
  if(STATE.placingPlayer === 'p2' && STATE.mode === 'cpu') {
    doneBtn.disabled = true;
    root.querySelector('#roster').innerHTML = `<p>La CPU está colocando sus unidades...</p>`;
    setTimeout(autoPlaceCPU, 1000); // Un pequeño retraso para simular la CPU
  } else if (STATE.placingPlayer === 'p2' && STATE.mode === 'pvp') {
    //  que P2 sepa que es su turno
    alert(`Turno de colocación para ${STATE.p2.name}.`);
  } else if (STATE.placingPlayer === 'p1' && STATE.mode === 'pvp') {
    // A que P1 sepa que es su turno (cuando es el segundo en colocar)
    alert(`Turno de colocación para ${STATE.p1.name}.`);
  }
}

// ** INICIO DE LA FUNCIÓN : handleDonePlacement **
function handleDonePlacement() {
  const owner = STATE.placingPlayer === 'p1' ? 0 : 1;
  const count = STATE.board.flat().filter(x => x && x.owner === owner).length;
  
  if (count !== 6) {
    alert(`Debes colocar los 6 guerreros de ${owner === 0 ? STATE.p1.name : STATE.p2.name}.`);
    return;
  }
  
  // Cuenta cuántas piezas ha colocado el *otro* jugador
  const otherOwner = 1 - owner;
  const otherCount = STATE.board.flat().filter(x => x && x.owner === otherOwner).length;

  // Modo CPU
  if (STATE.mode === 'cpu') {
    // La CPU siempre va después de P1. Si P1 termina (owner=0), va la CPU (owner=1).
    if (STATE.placingPlayer === 'p1') {
      STATE.placingPlayer = 'p2';
      updatePlacementSidePanel(); // Esto disparará autoPlaceCPU
      return;
    }
    // Si P2 (CPU) termina, el juego comienza (esto lo maneja autoPlaceCPU)
    return;
  }
  
  // Modo PVP
  if (STATE.mode === 'pvp') {
    // Si el OTRO jugador ya colocó sus 6, el juego puede comenzar
    if (otherCount === 6) {
      startGame();
      return;
    } else {
      // Si el OTRO jugador AÚN NO ha colocado sus 6, le toca a él
      STATE.placingPlayer = STATE.placingPlayer === 'p1' ? 'p2' : 'p1';
      updatePlacementSidePanel();
      return;
    }
  }
}
// ** FIN DE LA FUNCIÓN : handleDonePlacement **

function renderRoster(player){
  const owner = player==='p1'?0:1; 
  const rosterDiv = document.getElementById('roster'); 
  if(!rosterDiv) return;
  rosterDiv.innerHTML=''; 
  const list = owner===0?STATE.p1.warriors:STATE.p2.warriors;
  
  list.forEach((w,idx)=>{
    // Buscar si el guerrero ya está en el tablero por ID y Owner
    const isPlaced = STATE.board.flat().some(cell => cell && cell.id === w.id && cell.owner === owner);
    if(!isPlaced) {
      const node = document.createElement('div'); node.className='card'; node.innerHTML = `<div style='display:flex;gap:8px;align-items:center'><img src='${w.img}' width='46' height='46' style='border-radius:6px' /><div><strong>${w.name}</strong><div style='font-size:12px'>E:${w.energy}% R:${w.range} D:${w.damage}%</div></div></div>`;
      rosterDiv.appendChild(node);
    }
  });
  
  // Mostrar conteo
  const placedCount = STATE.board.flat().filter(x => x && x.owner === owner).length;
  const remaining = 6 - placedCount;
  const h3 = root.querySelector('.side-panel h3');
  if(h3) h3.innerHTML = `${(owner === 0 ? STATE.p1.name : STATE.p2.name)} - Coloca tus guerreros (${remaining} restantes)`;
}

function onCellClickPlace(r, c, cell) {
  const ownerToPlace = STATE.placingPlayer === 'p1' ? 0 : 1;

  // --- 🔊 SONIDO DE CLIC AL TOCAR UN GUERRERO ---
  playClickSound(); // 🔊 Reproduce el sonido al hacer clic
  // 1. Chequear si la celda es una roca
  if (STATE.board[r][c] && STATE.board[r][c].type === 'rock') {
    flashCell(r, c, true);
    return;
  }

  // 2. Chequear si ya hay un guerrero
  if (STATE.board[r][c] && STATE.board[r][c].owner !== undefined) {
    // Si es la propia pieza, la deseleccionamos (opcionalmente) o la quitamos para re-colocar
    if (STATE.board[r][c].owner === ownerToPlace) {
      STATE.board[r][c] = null;
      renderBoard();
      renderRoster(STATE.placingPlayer); // Re-renderizar para que vuelva a aparecer en la lista
    } else {
      flashCell(r, c, true);
    }
    return;
  }

  // 3. Chequear límites de colocación
  // P1 (owner 0) coloca en filas 8 y 9 (abajo)
  if (ownerToPlace === 0) {
    if (r < 8) {
      flashCell(r, c, true);
      return;
    }
  }
  // P2 (owner 1) coloca en filas 0 y 1 (arriba)
  else {
    if (r > 1) {
      flashCell(r, c, true);
      return;
    }
  }

  // 4. Colocar la siguiente pieza
  const roster = ownerToPlace === 0 ? STATE.p1.warriors : STATE.p2.warriors;
  // Buscar el primer guerrero de ese jugador que no esté en el tablero
  const nextWarrior = roster.find(w => !STATE.board.flat().some(cell => cell && cell.id === w.id && cell.owner === ownerToPlace));

  if (!nextWarrior) {
    return; // Ya colocó los 6
  }

  // Colocar copia del guerrero
  const w = { ...nextWarrior };
  w.owner = ownerToPlace;
  w.r = r;
  w.c = c;
  STATE.board[r][c] = w;

  renderBoard();
  renderRoster(STATE.placingPlayer);
}


function autoPlaceCPU(){
  // Eliminar cualquier pieza de CPU que pudiera estar en el tablero
  for(let r=0; r<10; r++) {
    for(let c=0; c<8; c++) {
      if(STATE.board[r][c] && STATE.board[r][c].owner === 1) {
        STATE.board[r][c] = null;
      }
    }
  }

  // place CPU warriors randomly in its first two rows (0 and 1)
  const spots=[]; for(let r=0;r<=1;r++) for(let c=0;c<8;c++) spots.push([r,c]);
  spots.sort(() => 0.5 - Math.random()); // Shuffle spots
  
  for(let i=0;i<6;i++){
    const spot = spots.find(s => !STATE.board[s[0]][s[1]]); // Find an empty, available spot
    if(!spot) break;
    const [r,c] = spot;
    // Asegura que la pieza tenga el dueño (owner: 1) y posición (r, c)
    const w={...STATE.p2.warriors[i], owner:1, r, c}; 
    STATE.board[r][c]=w;
  }
  
  renderBoard(); // ¡IMPORTANTE! Dibuja la posición de la CPU
  
  // Después de que la CPU coloca, el juego debe comenzar inmediatamente.
  const p1count = STATE.board.flat().filter(x=>x && x.owner===0).length; 
  const p2count = STATE.board.flat().filter(x=>x && x.owner===1).length; 
  
  if(p1count===6 && p2count===6){ 
    setTimeout(startGame, 500); // Empezar después de una pequeña pausa
  }
}


function renderBoard() {
  const boardDiv = document.getElementById('board');
  if (!boardDiv) return;
  
  const cells = boardDiv.querySelectorAll('.cell');
  
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 8; c++) {  
      const cell = STATE.board[r][c];
      const cellDiv = cells[r * 8 + c]; // 8 COLUMNAS
      
      // Limpiar estilos y contenido
      cellDiv.innerHTML = ''; 
      cellDiv.style.background = '';
      cellDiv.classList.remove('invalid');
      cellDiv.style.outline = ''; // Limpiar el highlight

    if (cell) {
    if (cell.type === 'rock') {
        // En lugar de emoji, usamos imagen
        const rockImg = document.createElement('div');
        rockImg.className = 'rock';
        rockImg.style.backgroundImage = "url('imagenes/roca2.png')"; // <--- ruta de tu imagen
        rockImg.style.backgroundSize = 'cover';
        rockImg.style.backgroundPosition = 'center';
        rockImg.style.width = '100%';
        rockImg.style.height = '100%';
        cellDiv.appendChild(rockImg);
    } else if (cell.owner !== undefined) { 
        const piece = document.createElement('div');
          piece.classList.add('piece');
          piece.dataset.name = cell.name; // Para el tooltip CSS
          piece.style.backgroundImage = `url('${cell.img}')`;
          piece.style.border = cell.owner === 0 ? '2px solid #4af' : '2px solid #f44';
          
          // Mostrar energía en la celda
          const energyBar = document.createElement('div');
          energyBar.style.cssText = `position:absolute; bottom:0; left:0; right:0; height:4px; background:rgba(0,0,0,0.5);`;
          const innerBar = document.createElement('div');
          innerBar.style.cssText = `height:100%; width:${cell.energy}%; background:${cell.energy > 50 ? 'green' : cell.energy > 20 ? 'orange' : 'red'}; transition: width 0.3s;`;
          energyBar.appendChild(innerBar);
          piece.appendChild(energyBar);
          
          // Coloca la pieza en la celda
          cellDiv.appendChild(piece);
        }
      }
    }
  }
  
  highlightSelected(); // Asegurar que la pieza seleccionada se resalte tras el render
}


// After both placed, start
function startGame(){
  alert('¡Empieza la Batalla!');
  // initialize turn based on coinWinner
  STATE.turn = STATE.coinWinner; 
  STATE.movesLeft = 0; 
  STATE.selected = null;

  // <--- AGREGADO PARA REINICIO: Restablecer el estado del dado
  STATE.diceRolled = false; 

  // <--- AGREGADO PARA REINICIO: Habilitar/Deshabilitar botones
  const rollBtn = document.getElementById('rollBtn');
  const endTurnBtn = document.getElementById('endTurn');
  if (rollBtn) rollBtn.disabled = false;    // Habilitar el dado para el nuevo turno
  if (endTurnBtn) endTurnBtn.disabled = true; // Deshabilitar finalizar turno hasta que se mueva o ataque

  renderPlayScreen();
  updateUI(); // Asegura que la interfaz muestre el estado correcto al inicio
  }

function showLog() {
    let logWindow = document.getElementById("log");
    if (!logWindow) {
        logWindow = document.createElement("div");
        logWindow.id = "log";
        logWindow.style.position = "absolute";
        logWindow.style.bottom = "10px";
        logWindow.style.right = "10px";
        logWindow.style.width = "300px";
        logWindow.style.height = "200px";
        logWindow.style.background = "rgba(0,0,0,0.7)";
        logWindow.style.color = "#fff";
        logWindow.style.fontSize = "12px";
        logWindow.style.overflowY = "auto";
        logWindow.style.padding = "8px";
        logWindow.style.borderRadius = "8px";
        logWindow.style.zIndex = "999";
        document.body.appendChild(logWindow);
    }
    logWindow.style.display = "block";
}

function hideLog() {
    const logWindow = document.getElementById("log");
    if (logWindow) logWindow.style.display = "none";
}

function startBattle() {
  document.getElementById("battleScreen").style.display = "flex"; // Mostrar pantalla de batalla
  showLog();
  clearLog();
  renderBoard();
  log("🎮 ¡La batalla comienza!");
}


function renderPlayScreen(){
  root.innerHTML='';
  const wrap = document.createElement('div'); wrap.className='board-wrap';
  const boardDiv = document.createElement('div'); boardDiv.className='board'; boardDiv.id='board';
  
  // Recrear el tablero visual para las celdas
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 8; c++) { 
      const cell = document.createElement('div');
      cell.className = 'cell'; 
      cell.dataset.r = r; cell.dataset.c = c; 
      if (window.innerWidth < 900) cell.classList.add('small');
      cell.addEventListener('click', () => onCellClickPlay(r, c)); 
      boardDiv.appendChild(cell);
    }
  }

  const side = document.createElement('div'); side.className='side-panel';
  side.innerHTML = `<h3>Turno: <span id='turnName'>${STATE.turn===0?STATE.p1.name:STATE.p2.name}</span></h3>
    <div class='stats'>
      <div class='info'>Movimientos restantes: <span id='movesLeft'>${STATE.movesLeft}</span></div>
      <div style='display:flex;gap:8px;align-items:center;margin-top:6px'>
        <div class='dice-container'>
          <div class='dice' id='dice'>
            <div class='dice-face'>1</div><div class='dice-face'>2</div><div class='dice-face'>3</div>
            <div class='dice-face'>4</div><div class='dice-face'>5</div><div class='dice-face'>6</div>
          </div>
        </div>
        <button class='btn' id='rollBtn'>Tirar dado</button>
      </div>
      <div style='margin-top:8px'><button class='end-turn' id='endTurn'>Finalizar turno</button></div>
    </div>
    
        <div id='warrior-info-panel' style='margin-top: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: #f9f9f9; min-height: 100px;'>
      <p style='margin:0; text-align:center;'>Haz clic en un guerrero para ver sus estadísticas.</p>
    </div>
    `; // FIN DEL side.innerHTML

  wrap.appendChild(boardDiv);
  wrap.appendChild(side);
  root.appendChild(wrap);

  // Crear contenedor de log visible
  showLog();
  clearLog();

  // Event listeners
  document.getElementById('rollBtn').addEventListener('click', rollDice);
  document.getElementById('endTurn').addEventListener('click', endTurn);

  renderBoard(); // Dibuja el estado inicial del juego
  
  // Si la CPU empieza (ganó la moneda), juega automáticamente
  if(STATE.mode==='cpu' && STATE.turn===1){ cpuPlay(); }
}
// ** FIN DE LA FUNCIÓN MODIFICADA: renderPlayScreen **
      
function updateWarriorInfoPanel(warrior) {
  const panel = document.getElementById('warrior-info-panel');
  if (!panel) return;

  if (!warrior) {
    panel.innerHTML = `<p style='margin:0; text-align:center;'>Haz clic en un guerrero para ver sus estadísticas.</p>`;
    return;
  }

  // Determinar el color del borde basado en el propietario
  const borderColor = warrior.owner === 0 ? '#4af' : '#f44';
  const ownerName = warrior.owner === 0 ? STATE.p1.name : STATE.p2.name;

  panel.innerHTML = `
    <div style='display:flex; gap:10px; align-items:center;'>
      <img src='${warrior.img}' width='60' height='60' style='border-radius:6px; border: 3px solid ${borderColor};' />
      <div>
        <h4 style='margin:0; color: ${borderColor};'>${warrior.name} (${ownerName})</h4>
        <p style='margin: 4px 0 0 0; font-size: 12px;'>${warrior.desc}</p>
      </div>
    </div>
    <div style='margin-top: 8px; font-size: 14px;'>
      <strong>Energía:</strong> <span style='color:${warrior.energy > 50 ? 'green' : warrior.energy > 20 ? 'orange' : 'red'};'>${warrior.energy}%</span> |
      <strong>Alcance:</strong> ${warrior.range} |
      <strong>Daño:</strong> ${warrior.damage}%
    </div>
  `;
}
// ** FIN DE LA NUEVA FUNCIÓN: updateWarriorInfoPanel **

// ---------------------------------------------------------------------
function rollDice(){ 
    // <--- CORRECCIÓN: Usar la variable de estado para verificar si ya tiró
    if(STATE.diceRolled){alert('Ya tiraste el dado este turno');return} 
    
    const diceEl = document.getElementById('dice');
    const d = Math.floor(Math.random()*6)+1; // d es el resultado: 1 a 6
    
    // ASIGNACIÓN CORRECTA: Los movimientos son exactamente el resultado del dado.
    STATE.movesLeft = d; 
    
    // <--- AGREGADO PARA REINICIO: Marcar que el dado fue tirado
    STATE.diceRolled = true;

    // Deshabilitar el botón de dado inmediatamente
    const rollBtn = document.getElementById('rollBtn');
    const endTurnBtn = document.getElementById('endTurn');
    if (rollBtn) rollBtn.disabled = true;
    if (endTurnBtn) endTurnBtn.disabled = false; // Habilitar 'Finalizar Turno'

    // Lógica para elegir la rotación correcta basada en tus pruebas.
    let finalRotation;
    
    switch(d) {
        case 1: finalRotation = [0, 0, 0]; break;
        case 2: finalRotation = [90, 0, 0]; break;
        case 3: finalRotation = [0, -90, 0]; break;
        case 4: finalRotation = [0, 90, 0]; break;
        case 5: finalRotation = [-90, 0, 0]; break;
        case 6: finalRotation = [0, 180, 0]; break;
        default: finalRotation = [0, 0, 0];
    }

    const [rx, ry, rz] = finalRotation;
    
    // Giro complejo y final
    const randomX = Math.floor(Math.random() * 3) + 3; 
    const randomY = Math.floor(Math.random() * 3) + 3;
    
    diceEl.style.transition = 'transform 1.5s ease-out';
    diceEl.style.transform = `rotateX(${360 * randomX + rx}deg) rotateY(${360 * randomY + ry}deg) rotateZ(${rz}deg)`;

    const diceSound = document.getElementById('diceSound');
    if(diceSound) {
        diceSound.currentTime = 0;
        diceSound.play();
    }

    setTimeout(() => {
        // Asegurar que se quede en la posición final limpia
        diceEl.style.transition = 'none'; 
        diceEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        
        updateUI();
        // Mostrar en el log el resultado real
        log(`Resultado del dado: ${d} movimientos.`); 
        
    }, 1600);
}
function onCellClickPlay(r,c){ 

  playClickSound();
  const cellVal = STATE.board[r][c]; 
  
  if(STATE.selected){ 
    const sel = STATE.selected;
    
    // Deseleccionar
    if(r===sel.r && c===sel.c){
      STATE.selected = null; 
      highlightSelected(); 
      updateWarriorInfoPanel(null); // Limpiar panel al deseleccionar
      return;
    }

    // Seleccionar pieza propia (mismo dueño)
    if(cellVal && cellVal.owner===sel.owner){ 
      STATE.selected = {r,c,owner:cellVal.owner}; 
      highlightSelected(); 
      updateWarriorInfoPanel(cellVal); // Actualizar panel con el nuevo seleccionado
      return;
    }

    // Si no es mi turno, no hacer nada (debería estar cubierto antes)
    if(sel.owner!==STATE.turn){ 
      alert('No es tu turno'); 
      STATE.selected=null; 
      highlightSelected(); 
      updateWarriorInfoPanel(null); // Limpiar panel si se deselecciona forzosamente
      return 
    }

    // Si el dado no ha sido tirado, no puede moverse/atacar
    if(!STATE.diceRolled) { alert('Debes tirar el dado primero.'); return; }

    // 1. INTENTO DE MOVIMIENTO (celda vacía o roca)
    if(!cellVal || cellVal.type==='rock'){
      // Si es roca, no se mueve
      if(cellVal && cellVal.type==='rock') { flashCell(r,c,true); return; }
      
      const dist = Math.abs(r-sel.r)+Math.abs(c-sel.c);
      if(dist===0) return;
      
      if(dist>STATE.movesLeft){ 
        flashCell(r,c,true); alert(`Necesitas ${dist} movimientos. Te quedan ${STATE.movesLeft}.`); return 
      }
      
      // Mover pieza
      STATE.board[r][c] = STATE.board[sel.r][sel.c]; 
      STATE.board[sel.r][sel.c] = null; 
      STATE.board[r][c].r=r; 
      STATE.board[r][c].c=c; 
      STATE.movesLeft -= dist; 
      
      STATE.selected = {r,c,owner:STATE.turn}; // Mantener seleccionada la pieza en la nueva posición
      log(`${STATE.board[r][c].name} se movió a (${r},${c})`);
      updateUI(); 
      renderBoard(); 
      highlightSelected(); 
      updateWarriorInfoPanel(STATE.board[r][c]); // Actualizar panel después del movimiento
      return;
    }
    
    // 2. INTENTO DE ATAQUE (pieza enemiga)
    if(cellVal.owner!==sel.owner){
      const attacker = STATE.board[sel.r][sel.c]; 
      const defender = cellVal;
      const dist = Math.max(Math.abs(sel.r-r), Math.abs(sel.c-c));
      
      if(dist>attacker.range){ flashCell(r,c,true); alert(`Fuera de rango. Rango: ${attacker.range}`); return }
      
      // Ataque consume 1 movimiento
      if(STATE.movesLeft < 1){ alert('No te quedan movimientos para atacar.'); return }

      // Realizar ataque
      defender.energy = Math.max(0, defender.energy - attacker.damage);
      log(`${(sel.owner===0?STATE.p1.name:STATE.p2.name)} atacó a ${defender.name} -${attacker.damage}%`);
      
      // Animación visual de daño
      const damageCell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
      if(damageCell) {
        damageCell.classList.add('damage-animation');
        setTimeout(() => { damageCell.classList.remove('damage-animation'); }, 300);
      }

      if(defender.energy<=0){ // Eliminar
        STATE.board[r][c]=null; 
        updateWarriorInfoPanel(null); // Limpiar si la pieza muere
        renderBoard(); checkWin();
      } else {
        updateWarriorInfoPanel(defender); // Actualizar estadísticas de la pieza dañada
        renderBoard();
      }
      
      STATE.movesLeft -=1; 
      updateUI(); 
      return;
    }
  } else { 
    // No pieza seleccionada -> Seleccionar pieza propia o ver info de pieza enemiga
    if(!cellVal) return; 
    
    // Si es mi pieza, la selecciono para mover/atacar
    if(cellVal.owner===STATE.turn){ 
      STATE.selected={r,c,owner:cellVal.owner}; 
      highlightSelected(); 
      updateWarriorInfoPanel(cellVal); // Mostrar info del guerrero propio seleccionado
      return;
    }
    
    // Si es pieza enemiga, solo muestro la info (no la selecciono para acción)
    if(cellVal.owner!==STATE.turn){
      updateWarriorInfoPanel(cellVal); // Mostrar info del guerrero enemigo
      return;
        playClickSound(); // 🔊 sonido también durante la batalla
    }
  }
}
function highlightSelected(){ 
  document.querySelectorAll('.cell').forEach(el=>el.style.outline=''); 
  if(STATE.selected){ 
    const sel = document.querySelector(`.cell[data-r='${STATE.selected.r}'][data-c='${STATE.selected.c}']`); 
    if(sel) sel.style.outline='3px solid rgba(205,161,91,0.6)'; 
  }
}
function flashCell(r,c,invalid){ 
  const sel = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`); 
  if(!sel) return; 
  sel.classList.add('invalid'); 
  setTimeout(()=>sel.classList.remove('invalid'),700);
}

function updateUI(){ 
  const turnNameEl = document.getElementById('turnName');
  const movesLeftEl = document.getElementById('movesLeft');
  const rollBtn = document.getElementById('rollBtn');
  
  if(turnNameEl) turnNameEl.innerText = STATE.turn===0?STATE.p1.name:STATE.p2.name; 
  if(movesLeftEl) movesLeftEl.innerText = STATE.movesLeft; 
  // Actualizar botón de dado
  if(rollBtn) rollBtn.disabled = STATE.diceRolled;
}
let cpuThinking = false; // 🔒 evita que cpuPlay se ejecute múltiples veces

function endTurn() { 
  STATE.selected = null; 
  highlightSelected(); 
  STATE.turn = 1 - STATE.turn; 
  STATE.movesLeft = 0; 
  STATE.diceRolled = false; 
  updateUI(); 

  const currentName = STATE.turn === 0 ? STATE.p1.name : STATE.p2.name;
  log(`--- Turno de ${currentName} ---`);

  // 🧠 Si es turno de la CPU
  if (STATE.mode === 'cpu' && STATE.turn === 1 && !cpuThinking) {
    cpuThinking = true; 
    // Simula “tiempo de pensamiento” del CPU
    setTimeout(() => {
      cpuPlay();
      cpuThinking = false; 
    }, 800); // 0.8s = fluido y seguro
  }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateStateAndLists() {
    // Actualiza las listas de piezas propias y enemigas
    STATE.myPieces = STATE.board.flat().filter(x => x && x.owner === 1);
    STATE.enemyPieces = STATE.board.flat().filter(x => x && x.owner === 0);

    renderBoard();  // dibuja el tablero actualizado
    checkWin();     // revisa si hay ganador
    updateUI();     // actualiza cualquier UI adicional
}

/**
 * Función auxiliar para verificar si una celda es un obstáculo (piedra).
 * Asume que los obstáculos (piedras) están representados por la cadena 'rock'
 * en STATE.board[r][c].
 */
function isObstacle(r, c) {
    if (!STATE || !STATE.board) return true; 

    const boardSize = STATE.board.length;

    // 1. Fuera de los límites del tablero
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
        return true; 
    }

    // 2. Si el contenido de la celda es la representación de la piedra
    if (STATE.board[r][c] === 'rock') {
        return true;
    }
    
    return false;
}

/**
 * Verifica si hay una piedra directamente entre el atacante y el enemigo.
 * Esto solo aplica a piezas de rango 1.
 */
function isPathBlockedByRock(attacker, target) {
    if (attacker.range > 1) return false; // Piezas de rango 2 o más no se bloquean

    const dr = Math.sign(target.r - attacker.r);
    const dc = Math.sign(target.c - attacker.c);

    // Chequea solo la casilla inmediatamente adyacente en el camino
    const intermediateR = attacker.r + dr;
    const intermediateC = attacker.c + dc;

    // Si la piedra está justo en el camino
    return isObstacle(intermediateR, intermediateC);
}


async function cpuPlay() {
    const rollBtn = document.getElementById('rollBtn');
    const endTurnBtn = document.getElementById('endTurn');

    if (rollBtn) rollBtn.disabled = true;
    if (endTurnBtn) endTurnBtn.disabled = true;

    log("🤖 La CPU está pensando...");
    await sleep(800);

    // --- Tirar el dado ---
    rollDice();
    log(`🎲 CPU tiró el dado: ${STATE.movesLeft} movimientos disponibles.`);
    await sleep(1000);

    // Función para actualizar estado y renderizar
    const updateStateAndLists = () => {
        STATE.myPieces = STATE.board.flat().filter(p => p && p.owner === 1);
        STATE.enemyPieces = STATE.board.flat().filter(p => p && p.owner === 0);
        renderBoard();
        checkWin();
        updateUI();
    };

    updateStateAndLists();

    // Bucle de acciones de la CPU
    while (STATE.movesLeft > 0 && STATE.myPieces.length > 0 && STATE.enemyPieces.length > 0) {
        let actionTaken = false;

        // --- 1️⃣ ATAQUE GRUPAL (MÁXIMA AGRESIVIDAD) ---
        let bestGroupAttack = null;
        let maxTotalDamage = 0;

        for (const enemy of STATE.enemyPieces) {
            const attackers = STATE.myPieces.filter(p => {
                const isInRange = Math.max(Math.abs(enemy.r - p.r), Math.abs(enemy.c - p.c)) <= p.range;

                if (p.range <= 1 && isInRange) {
                    return !isPathBlockedByRock(p, enemy);
                }
                
                return isInRange;
            });

            if (attackers.length === 0) continue;

            const totalDamage = attackers.reduce((sum, a) => sum + a.damage, 0);

            if (totalDamage > maxTotalDamage) {
                maxTotalDamage = totalDamage;
                bestGroupAttack = { enemy, attackers };
            }
        }
        
        // Ejecutar el mejor ataque grupal si hay uno y movimientos restantes
        if (bestGroupAttack && STATE.movesLeft >= 1) {
            const { enemy, attackers } = bestGroupAttack;

            log(`⚔️ CPU coordina un ataque grupal agresivo contra ${enemy.name}! Daño total: ${maxTotalDamage}`);
            await sleep(800);

            const sortedAttackers = attackers.sort((a, b) => b.damage - a.damage);

            for (const a of sortedAttackers) {
                if (STATE.movesLeft <= 0 || enemy.energy <= 0) break;
                
                if (Math.max(Math.abs(enemy.r - a.r), Math.abs(a.c - a.c)) <= a.range) {
                    animateAttack(a.r, a.c);
                    animateDamage(enemy.r, enemy.c);

                    enemy.energy = Math.max(0, enemy.energy - a.damage);
                    STATE.movesLeft -= 1;
                    log(`🔹 ${a.name} golpea a ${enemy.name} (-${a.damage}%)`);
                    updateStateAndLists();
                    await sleep(700);

                    if (enemy.energy <= 0) {
                        log(`💀 ${enemy.name} ha sido eliminado por la CPU.`);
                        animateDeath(enemy.r, enemy.c);
                        STATE.board[enemy.r][enemy.c] = null;
                        updateStateAndLists();
                        await sleep(700);
                        break;
                    }
                }
            }

            actionTaken = true;
        }

        if (actionTaken) continue;

        // --- 2️⃣ ATAQUE INDIVIDUAL (MÁXIMA AGRESIVIDAD) ---
        let bestAttack = null;
        let maxDamage = 0;

        for (const attacker of STATE.myPieces) {
            const targets = STATE.enemyPieces.filter(e => {
                const isInRange = Math.max(Math.abs(e.r - attacker.r), Math.abs(e.c - attacker.c)) <= attacker.range;
                
                if (attacker.range <= 1 && isInRange) {
                    return !isPathBlockedByRock(attacker, e);
                }

                return isInRange;
            });
            
            for (const target of targets) {
                if (attacker.damage > maxDamage) { 
                    maxDamage = attacker.damage;
                    bestAttack = { attacker, target };
                }
            }
        }

        if (bestAttack && STATE.movesLeft >= 1) {
            const { attacker, target } = bestAttack;

            animateAttack(attacker.r, attacker.c);
            animateDamage(target.r, target.c);

            target.energy = Math.max(0, target.energy - attacker.damage);
            STATE.movesLeft -= 1;
            log(`🤖 CPU: ${attacker.name} atacó a ${target.name} (-${attacker.damage}%) con ataque individual agresivo`);
            updateStateAndLists();
            await sleep(600);

            if (target.energy <= 0) {
                log(`💀 ${target.name} ha sido eliminado por la CPU.`);
                animateDeath(target.r, target.c);
                STATE.board[target.r][target.c] = null;
                updateStateAndLists();
                await sleep(600);
            }

            actionTaken = true;
            continue;
        }

        // --- 3️⃣ MOVIMIENTO ESTRATÉGICO EN GRUPO ---
        
        // Todas las piezas son consideradas "movers" para el avance.
        const movers = STATE.myPieces; 

        if (movers.length > 0 && STATE.movesLeft > 0) {
            
            // Si no se atacó, marcamos actionTaken=true para forzar que el bucle continúe si hay movimientos.
            actionTaken = true; 

            // Ordenamos a los "movers" para que la pieza más cercana al enemigo se mueva primero.
            movers.sort((a, b) => {
                if (STATE.enemyPieces.length === 0) return 0;
                
                const getMinDist = (p) => STATE.enemyPieces.reduce((min, e) => {
                    const dist = Math.abs(e.r - p.r) + Math.abs(e.c - p.c);
                    return dist < min ? dist : min;
                }, 1000); 

                // Orden ascendente: el más cercano (a) va primero.
                return getMinDist(a) - getMinDist(b); 
            });
            
            // CAMBIO CLAVE: Iteramos sobre las piezas MIENTRAS queden movimientos (STATE.movesLeft > 0)
            // en lugar de romper el bucle con 'pieceMoved'. Esto permite el movimiento grupal.
            for (const mover of movers) {
                // Intentamos mover una pieza tantas veces como sea posible por turno
                // (aunque en tu juego por turnos es solo 1 movimiento por pieza).
                if (STATE.movesLeft <= 0) break;
                if (STATE.enemyPieces.length === 0) break; 
                
                // Encontrar al enemigo más cercano (objetivo del grupo)
                const nearest = STATE.enemyPieces.reduce((a, b) => {
                    const distA = Math.abs(a.r - mover.r) + Math.abs(a.c - mover.c);
                    const distB = Math.abs(b.r - mover.r) + Math.abs(b.c - mover.c);
                    return distA < distB ? a : b;
                });

                const dr = Math.sign(nearest.r - mover.r);
                const dc = Math.sign(nearest.c - mover.c);
                
                // Generamos y filtramos los movimientos
                const allPossibleMoves = [
                    { r: mover.r + dr, c: mover.c + dc }, 
                    { r: mover.r + dr, c: mover.c },      
                    { r: mover.r, c: mover.c + dc },      
                    { r: mover.r + dc, c: mover.c + dr }, 
                    { r: mover.r - dc, c: mover.c - dr },
                    { r: mover.r - dr, c: mover.c - dc },
                    { r: mover.r - dr, c: mover.c },      
                    { r: mover.r, c: mover.c - dc }       
                ];

                const validMoves = allPossibleMoves.filter(move => {
                    const boardSize = STATE.board.length;
                    const inBounds = move.r >= 0 && move.r < boardSize && move.c >= 0 && move.c < boardSize;
                    
                    return inBounds && STATE.board[move.r][move.c] === null && !isObstacle(move.r, move.c);
                }).sort((a, b) => {
                    const distA = Math.abs(a.r - nearest.r) + Math.abs(a.c - nearest.c);
                    const distB = Math.abs(b.r - nearest.r) + Math.abs(b.c - nearest.c);
                    return distA - distB; // El que se acerca más va primero
                });


                if (validMoves.length > 0) {
                    const bestMove = validMoves[0];
                    const newR = bestMove.r;
                    const newC = bestMove.c;

                    // Ejecución del movimiento
                    STATE.board[mover.r][mover.c] = null;
                    mover.r = newR;
                    mover.c = newC;
                    STATE.board[newR][newC] = mover;
                    STATE.movesLeft -= 1;

                    // Se registra el movimiento. La clave es que el bucle 'for (const mover of movers)'
                    // seguirá intentando mover a la siguiente pieza hasta que STATE.movesLeft llegue a cero.
                    log(`🤖 Movimiento Grupal: ${mover.name} avanza hacia ${nearest.name} (${newR},${newC}).`);
                    updateStateAndLists();
                    await sleep(300); // Reducimos el sleep para que el movimiento de grupo sea más rápido
                }
            }
        }

        // Si no se atacó y no se intentó mover (es decir, ya no hay movimientos), rompemos el bucle.
        if (!actionTaken && STATE.movesLeft === 0) break;
    }

    // === Fin del turno de la CPU ===
    log("🕓 CPU terminó su turno. Ahora te toca a ti.");
    await sleep(800);
    endTurn();

    if (rollBtn) rollBtn.disabled = false;
    if (endTurnBtn) endTurnBtn.disabled = false;
}

function animateAttack(r, c) {
  const cell = document.querySelector(`[data-pos='${r},${c}']`);
  if (cell) {
    cell.classList.add('attack');
    setTimeout(() => cell.classList.remove('attack'), 400);
  }
}

function animateDamage(r, c) {
  const cell = document.querySelector(`[data-pos='${r},${c}']`);
  if (cell) {
    cell.classList.add('damage');
    setTimeout(() => cell.classList.remove('damage'), 500);
  }
}

function animateDeath(r, c) {
  const cell = document.querySelector(`[data-pos='${r},${c}']`);
  if (cell) {
    cell.classList.add('death');
    setTimeout(() => cell.classList.remove('death'), 700);
  }
}
function startBattle() {
  clearLog();       // limpia log
  renderBoard();    // muestra el tablero
  log("🛡️ Tus guerreros están listos para la batalla.");
  // Aquí puedes iniciar el turno del jugador 1 o la CPU
}


// Buffer opcional para mantener últimas 50 entradas
// Buffer opcional para mantener últimas 50 entradas
const LOG_BUFFER = [];
const LOG_MAX_LINES = 50;

function log(msg) {
    const logWindow = document.getElementById("log");
    if (!logWindow) return;
    const p = document.createElement('div');
    p.textContent = msg;
    logWindow.appendChild(p);
    logWindow.scrollTop = logWindow.scrollHeight;
}

function clearLog() {
    const logWindow = document.getElementById("log");
    if (logWindow) logWindow.innerHTML = '';
}

function updateLogPosition() {
    const board = document.getElementById("board");
    if (!board || !logWindow) return;

    const rect = board.getBoundingClientRect();
    const margin = 10;

    // Posición por defecto: a la derecha del tablero
    let top = rect.top;
    let left = rect.right + margin;

    // Ajuste horizontal: si se sale de la pantalla
    if (left + logWindow.offsetWidth > window.innerWidth) {
        left = rect.left - logWindow.offsetWidth - margin; // poner a la izquierda del tablero
    }

    // Ajuste vertical: si se sale de la pantalla
    if (top + logWindow.offsetHeight > window.innerHeight) {
        top = window.innerHeight - logWindow.offsetHeight - margin; // mover hacia arriba
    }
    if (top < margin) top = margin; // nunca tocar top = 0

    logWindow.style.top = top + "px";
    logWindow.style.left = left + "px";
}

// Re-posicionar al cambiar tamaño o al rotar pantalla
window.addEventListener("resize", updateLogPosition);
window.addEventListener("orientationchange", updateLogPosition);

// Posicionar al cargar
updateLogPosition();




function checkWin(){ 
  const p1Alive = STATE.board.flat().filter(x=>x && x.owner===0).length; 
  const p2Alive = STATE.board.flat().filter(x=>x && x.owner===1).length; 
  if(p1Alive===0 || p2Alive===0){ 
    const winner = p1Alive>0?STATE.p1.name:STATE.p2.name; 
    showWinner(winner); 
  }
}


// Variable global (o al menos fuera de la función showWinner) 
// para guardar el ID de nuestro intervalo de confeti.
let confettiInterval = null;

/**
 * Función separada para crear UN solo papelito de confeti.
 * Esto hace que sea más fácil llamarlo repetidamente.
 */
function createConfettiPiece() {
    // Busca el contenedor. Si no existe (porque salimos al menú), se detiene.
    const conf = document.getElementById('confetti');
    if (!conf) {
        if (confettiInterval) clearInterval(confettiInterval);
        return;
    }

    const p = document.createElement('div');
    p.style.position = 'absolute'; // Posición absoluta dentro del contenedor 'fixed'
    p.style.left = Math.random() * 100 + '%'; // Comienza en cualquier lugar horizontal
    p.style.top = '-20px'; // Comienza justo arriba de la pantalla
    p.style.width = (Math.random() * 10 + 8) + 'px'; // Tamaños variados
    p.style.height = (Math.random() * 20 + 10) + 'px'; // Tamaños variados
    p.style.background = ['#ffd700', '#ff6b6b', '#8ee29a', '#6ec1ff'][Math.floor(Math.random() * 4)];
    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    p.style.opacity = 1; // Comienza totalmente visible
    
    // Duración de caída aleatoria (entre 3 y 5 segundos)
    const fallDuration = Math.random() * 2 + 3; 
    
    // Transición para caer y luego desvanecerse
    p.style.transition = `top ${fallDuration}s linear, opacity ${fallDuration / 2}s linear ${fallDuration / 2}s`;
    
    conf.appendChild(p);

    // Pequeño retraso para que el navegador aplique la transición
    setTimeout(() => {
        p.style.top = '120%'; // Cae hasta 120% (fuera de la pantalla por abajo)
        p.style.opacity = 0; // Se desvanece
    }, 50);

    // ¡MUY IMPORTANTE! Limpiamos el DOM.
    // Removemos el elemento después de que haya terminado de caer.
    setTimeout(() => {
        p.remove();
    }, fallDuration * 1000 + 100); // (duración de caída + 0.1s de margen)
}

/**
 * Tu función showWinner, ahora modificada.
 */
function showWinner(name) {
  // --- 🔊 Sonido de victoria ---
  const victorySound = new Audio('sonido/crowd-cheer-ii-6263victoria (2).mp3');
  victorySound.volume = 0.6;
  victorySound.loop = true;
  victorySound.play().catch(()=>{});

  // 🔥 limpiar cualquier resto del tablero o estado viejo
  if (STATE) {
    STATE.board = null;
    STATE.selected = null;
    STATE.movesLeft = 0;
  }

  hideLog();
  root.innerHTML = `
    <div id='confetti' class='confetti' style='position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:99; overflow:hidden;'></div>
    <div style='text-align:center; padding:20px; position:relative; z-index:100;'>
      <h1>¡Ganador: ${name}!</h1>
      <div style='margin-top:12px'>
        <button class='btn' id='rematch'>Jugar de nuevo</button> 
        <button class='btn ghost' id='toMenu'>Salir</button>
      </div>
    </div>
  `;

  // ⚙️ Listener "Jugar de nuevo"
  document.getElementById('rematch').addEventListener('click', () => {
    if (confettiInterval) clearInterval(confettiInterval);
    victorySound.pause();
    victorySound.currentTime = 0;

    STATE.board = null;
    STATE.selected = null;
    STATE.movesLeft = 0;

    showPlacementScreen();
  });

  // ⚙️ Listener "Salir"
  document.getElementById('toMenu').addEventListener('click', () => {
    if (confettiInterval) clearInterval(confettiInterval);
    victorySound.pause();
    victorySound.currentTime = 0;

    // 🔄 limpiar tablero y estado completamente
    if (STATE) {
      STATE.board = null;
      STATE.selected = null;
      STATE.movesLeft = 0;
    }

    // 🧼 limpiar todo el contenido actual
    root.innerHTML = '';

    // ✅ volver al splash
    if (typeof window.showSplash === 'function') {
      window.showSplash();
    } else {
      console.error('❌ No se encontró la función showSplash');
    }
  });

  // 🎉 confeti
  if (confettiInterval) clearInterval(confettiInterval);
  for (let i = 0; i < 100; i++) createConfettiPiece();
  confettiInterval = setInterval(createConfettiPiece, 100);
}


// 🚀 INICIO DE LA APLICACIÓN
window.onload = window.showSplash;

// 🔊 Función global de sonido para clics de guerreros
function playClickSound() {
  const clickSound = new Audio('sonido/arcade-ui-6-229503click.mp3'); // Ajusta la ruta según tu carpeta
  clickSound.volume = 0.5;
  clickSound.play().catch(() => {}); // Previene errores si el navegador bloquea el autoplay
}

// 🔁 Función global para reiniciar el estado del juego
function resetGameState() {
  STATE = {
    board: null,
    selected: null,
    movesLeft: 0,
    turn: 0,
    p1: { name: "Jugador 1", warriors: [] },
    p2: { name: "Jugador 2", warriors: [] },
    mode: null,
  };

  // Limpieza visual (por si el tablero quedó en pantalla)
  const boardEl = document.getElementById('board');
  if (boardEl) boardEl.remove();

  // Limpiar intervalos o animaciones si existen
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}
