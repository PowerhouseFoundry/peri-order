// ====== Peri-Order App (stable build) ======

// In-memory order
const order = [];

// Core elements
const itemCountEl = document.getElementById('itemCount');
const orderListEl  = document.getElementById('orderList');
const clearBtn     = document.getElementById('clearOrder');

// Modals
const spiceModal   = document.getElementById('spiceModal');
const sideModal    = document.getElementById('sideModal');
const portionModal = document.getElementById('portionModal');

const drinkModal   = document.getElementById("drinkModal");
// Pending selections
let pendingItem = null;     // { name, type }
let pendingPortion = null;  // string like '1/4 Chicken'

function renderOrder(){
  if(order.length === 0){
    orderListEl.innerHTML = '<li class="order-empty">No items yet. Tap a card to add.</li>';
    itemCountEl.textContent = '0 items';
    return;
  }
  orderListEl.innerHTML = '';
  let totalQty = 0;
  order.forEach((line, idx) => {
    totalQty += line.qty;
    const li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML = `
      <div class="meta">
        <span class="label">${line.name}</span>
        <span class="note">${line.note || ''}</span>
      </div>
      <div class="qty">
        <button class="btn ghost" aria-label="Decrease">−</button>
        <strong>${line.qty}</strong>
        <button class="btn" aria-label="Increase">+</button>
        <button class="btn ghost" aria-label="Remove">Remove</button>
      </div>
    `;
    const buttons = li.querySelectorAll('button');
    const decBtn = buttons[0];
    const incBtn = buttons[1];
    const remBtn = buttons[2];
    decBtn.addEventListener('click', () => { line.qty = Math.max(1, line.qty - 1); renderOrder(); });
    incBtn.addEventListener('click', () => { line.qty += 1; renderOrder(); });
    remBtn.addEventListener('click', () => { order.splice(idx, 1); renderOrder(); });
    orderListEl.appendChild(li);
  });
  itemCountEl.textContent = `${totalQty} item${totalQty===1?'':'s'}`;
}

function addLine(name, note){
  const keyNote = note || '';
  const existing = order.find(l => l.name === name && (l.note||'') === keyNote);
  if(existing){ existing.qty += 1; }
  else{ order.push({ name, note: keyNote, qty: 1 }); }
  renderOrder();
}

function openSpiceFor(item){
  pendingItem = item; // {name, type}
  spiceModal?.showModal();
}

function handleAddCard(article){
  const itemName = article.dataset.item;
  const type = article.dataset.type;
  if(type === 'portion-then-spice'){
    pendingItem = { name: itemName, type };
    pendingPortion = null;
    portionModal?.showModal();
  } else if(type === 'spicy-main'){
    openSpiceFor({ name: itemName, type });
  } else if(type === 'side-choice'){
    pendingItem = { name: itemName, type };
    sideModal?.showModal();
  } else if(type === 'drink-choice'){
    pendingItem = { name: itemName, type };
    drinkModal?.showModal();
  } else {
    addLine(itemName);
  }
}

// Attach events to card buttons
function attachCardButtons(){
  document.querySelectorAll('.card .add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const article = e.currentTarget.closest('article');
      if(article){ handleAddCard(article); }
    });
  });

  // Keyboard: enter/space on whole card
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        handleAddCard(card);
      }
    });
  });
}

// Modal option handlers
function attachModalHandlers(){
  // Portion -> then Spice
  if(portionModal){
    portionModal.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingPortion = btn.dataset.portion; // e.g. '1/4 Chicken'
        spiceModal?.showModal();
      });
    });
  
  // Drinks (Coke / Fanta / Sprite / Water)
  if(drinkModal){
    drinkModal.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        const drink = btn.dataset.drink;
        addLine(drink);
        pendingItem = null;
      });
    });
  }
}

  // Spice (works for both spicy mains and chicken-after-portion)
  if(spiceModal){
    spiceModal.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        const spice = btn.dataset.spice;
        if(pendingItem){
          if(pendingItem.type === 'portion-then-spice' && pendingPortion){
            addLine(pendingPortion, spice);
            pendingPortion = null;
            pendingItem = null;
          } else {
            addLine(pendingItem.name, spice);
            pendingItem = null;
          }
        }
      });
    });
  }

  // Sides (Rice/Fries/Corn)
  if(sideModal){
    sideModal.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        const side = btn.dataset.side;
        addLine(side);
        pendingItem = null;
      });
    });
  }
}

// Clear order
clearBtn?.addEventListener('click', () => {
  order.splice(0, order.length);
  renderOrder();
});

// Init
attachCardButtons();
attachModalHandlers();
renderOrder();
