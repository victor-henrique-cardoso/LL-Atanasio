const vendorPhone = '556993807246';

const products = [
  {id:1, name:'Power Whey', price:230.00, category:'Suplementos', image:'imagems/1be8328c-5345-451f-b39d-a4df70591c3d.png'},
  {id:2, name:'Power Detox', price:180.00, category:'Chás', desc:'Blend natural para desintoxicar e acelerar metabolismo.', image:'imagems/3835b8b6-046a-4c0e-966e-1237759599a2.png'},
  {id:3, name:'Power Silver', price:280.00, category:'Acessórios', desc:'Cinta modeladora para uso durante exercícios.', image:'./imagems/388f6162-2a20-411f-885d-484922cb367c.png'},
  {id:4, name:'Power Colágeno', price:150.00, category:'Suplementos', desc:'Shake com proteínas e fibras para saciedade.', image:'imagems/50bc4467-1c04-4ae8-96af-b9f1fca4dbc3.png'},
  {id:5, name:'Power Vitamina', price:150.00, category:'Chás', desc:'Chá termogênico com sabor agradável.', image:'imagems/6720eca7-4f7d-4ee3-9f13-528069ae725b.png'},
  {id:6, name:'Power Creatina', price:150.00, category:'Acessórios', desc:'Tapete antiderrapante para treino em casa.', image:'imagems/6805a1a3-1290-4980-b83e-25d8ca61cfd0.png'},
  {id:7, name:'Power Golden', price:260.00, category:'Suplementos', desc:'Termogênico avançado para queima de gordura.', image:'imagems/6d64c61b-6212-4e8c-8212-cb2948f80cbd.png'},
  {id:8, name:'Power Creatina Goma', price:59.90, category:'Chás', desc:'Chá verde de alta qualidade para acelerar o metabolismo.', image:'imagems/9b41c8e8-0a4e-48b9-b00d-2e0312aa40a7.png'},
  {id:9, name:'Power Pump', price:150.00, category:'Acessórios', desc:'Rolo para liberação miofascial e alívio muscular.', image:'imagems/d656bede-5f7d-4bd3-8c6b-8ab0345eaa7e.png'},
  {id:10, name:'Power Coffee', price:180.00, category:'Suplementos', desc:'Proteína isolada para recuperação muscular rápida.', image:'imagems/power coffee.png'},
  {id:11, name:'Power Reedy', price:300.00, category:'Chás', desc:'Chá de hibisco 100% natural para auxiliar na perda de peso.', image:'imagems/Power reedy.png'},
  {id:12, name:'Power Omega 3', price:120.00, category:'Acessórios', desc:'Corda de pular ajustável para exercícios cardiovasculares.', image:'imagems/omega 3.png'},
  {id:13, name:'Power Diamond', price:290.00, category:'Suplementos', desc:'Aminoácidos essenciais para recuperação muscular.', image:'imagems/power diamante.png'}
];

let cart = JSON.parse(localStorage.getItem('cart_v1')) || [];

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const formatPrice = v => v.toFixed(2).replace('.', ',');

// --- SEM CATEGORIAS - SOMENTE RENDERIZAÇÃO E BUSCA ---
function renderProducts(search='') {
  const el = $('#products');
  const s = search.toLowerCase();

  let list = products.filter(p => 
    p.name.toLowerCase().includes(s) || 
    (p.desc && p.desc.toLowerCase().includes(s))
  );

  el.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" />
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <div class="card-footer">
          <div class="price">R$ ${formatPrice(p.price)}</div>
          <button class="btn add-btn">Adicionar</button>
        </div>
      </div>
    `;
    card.querySelector('.add-btn').onclick = ()=> addToCart(p.id);
    el.appendChild(card);
  });
}

function saveCart() {
  localStorage.setItem('cart_v1', JSON.stringify(cart));
}

function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item) item.qty++;
  else cart.push({id, qty:1});
  saveCart();
  updateCartUI();
}

function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta){
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) removeFromCart(id);
  saveCart();
  updateCartUI();
}

function updateCartUI(){
  const countEl = $('#cart-count');
  const itemsEl = $('#cart-items');
  const totalEl = $('#cart-total');

  const total = cart.reduce((sum,it)=>{
    const p = products.find(pp=>pp.id===it.id);
    return sum + (p.price * it.qty);
  },0);

  countEl.textContent = cart.reduce((s,i)=>s+i.qty,0);

  itemsEl.innerHTML = '';
  if(cart.length===0){
    itemsEl.innerHTML = '<li>Seu carrinho está vazio.</li>';
  }

  cart.forEach(it=>{
    const p = products.find(pp=>pp.id===it.id);
    const li = document.createElement('li');
    li.className='cart-item';
    li.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="meta">
        <div><strong>${p.name}</strong></div>
        <div class="muted">R$ ${formatPrice(p.price)}</div>
      </div>
      <div class="qty-controls">
        <button class="btn secondary dec">-</button>
        <div class="qty">${it.qty}</div>
        <button class="btn secondary inc">+</button>
        <button class="btn secondary rem">Remover</button>
      </div>
    `;
    li.querySelector('.dec').onclick = ()=> changeQty(it.id, -1);
    li.querySelector('.inc').onclick = ()=> changeQty(it.id, +1);
    li.querySelector('.rem').onclick = ()=> removeFromCart(it.id);
    itemsEl.appendChild(li);
  });

  totalEl.textContent = formatPrice(total);
}

function checkoutWhatsApp(){
  if(!vendorPhone){ alert('Configure o número do vendedor.'); return; }
  if(cart.length===0){ alert('Seu carrinho está vazio.'); return; }

  const customerNameEl = $('#customer-name');
  const name = customerNameEl.value.trim();
  if(!name){ alert('Digite seu nome.'); customerNameEl.focus(); return; }

  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const payment = paymentEl ? paymentEl.value : 'Não informado';

  let msg = `Olá, meu nome é ${encodeURIComponent(name)}. Gostaria de finalizar a compra:%0A%0AForma de pagamento: ${encodeURIComponent(payment)}%0A%0A`;

  cart.forEach(it=>{
    const p = products.find(pp=>pp.id===it.id);
    msg += `- ${encodeURIComponent(p.name)} x ${it.qty} = R$ ${formatPrice(p.price * it.qty)}%0A`;
  });

  const total = cart.reduce((s,it)=> s + products.find(p=>p.id===it.id).price * it.qty, 0);
  msg += `%0ATotal: R$ ${formatPrice(total)}`;

  window.open(`https://wa.me/${vendorPhone}?text=${msg}`, '_blank');
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  updateCartUI();

  $('#open-cart').onclick = ()=> $('#cart-modal').classList.remove('hidden');
  $('#close-cart').onclick = ()=> $('#cart-modal').classList.add('hidden');
  $('#checkout-wpp').onclick = checkoutWhatsApp;

  $('#search').addEventListener('input', ()=>{
    renderProducts($('#search').value.trim());
  });
});
