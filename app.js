
const vendorPhone = '556984799039';

const products = [
  {id:1,
  name:'SlimFit Caps',
  price:129.90,
  category:'Suplementos',
  desc:'Cápsulas naturais para controle de apetite.', 
  image:'./imagems/images.png'
  },

  {
  id:2, 
  name:'Chá Detox', 
  price:49.90, 
  category:'Chás', 
  desc:'Blend natural para desintoxicar e acelerar metabolismo.', image:'./imagems/images.png'
  },

  {
    id:3, 
    name:'Belt Slim', 
    price:79.90, 
    category:'Acessórios', 
    desc:'Cinta modeladora para uso durante exercícios.',image:'./imagems/images.png'
  },

  {
    id:4, 
    name:'Shake Proteico', 
    price:99.90, 
    category:'Suplementos', 
    desc:'Shake com proteínas e fibras para saciedade.', image:'./imagems/images.png'
  },

  {
    id:5, 
    name:'Chá Emagrecedor', 
    price:39.90, 
    category:'Chás', 
    desc:'Chá termogênico com sabor agradável.', 
    image:'./imagems/images.png'
  },

  {
    id:6, 
    name:'Tapete Yoga', 
    price:59.90, 
    category:'Acessórios', 
    desc:'Tapete antiderrapante para treino em casa.', 
    image:'./imagems/images.png'
  },

  
];

// Estado do carrinho: array de {id, qty}
let cart = JSON.parse(localStorage.getItem('cart_v1')) || [];

// Helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const formatPrice = v => v.toFixed(2).replace('.', ',');

// Render
function renderCategories(){
  const el = $('#categories');
  const cats = ['Todos', ...Array.from(new Set(products.map(p=>p.category)))];
  el.innerHTML = '';

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;

    btn.onclick = () => {
      // ativar botão
      $$('#categories button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // renderizar produtos
      renderProducts(cat === 'Todos' ? null : cat, $('#search').value.trim());

      // FECHAR DROPDOWN NO MOBILE
      const catList = document.getElementById('categories');
      const catToggle = document.getElementById('cat-toggle');

      if (window.innerWidth <= 700) {
        catList.classList.remove('open');
        catToggle.textContent = cat;
      }
    };

    if(cat === 'Todos') btn.classList.add('active');
    el.appendChild(btn);
  });
}


function renderProducts(category=null, search=''){
  const el = $('#products');
  const s = search.toLowerCase();
  let list = products.filter(p => (category ? p.category === category : true) && (p.name.toLowerCase().includes(s) || p.desc.toLowerCase().includes(s)));
  el.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.image}"  />
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <div class="card-desc">${p.desc}</div>
        <div class="card-footer">
          <div class="price">R$ ${formatPrice(p.price)}</div>
          <button class="btn add-btn">Adicionar</button>
        </div>
      </div>`;
    card.querySelector('.add-btn').onclick = ()=>{ addToCart(p.id) };
    el.appendChild(card)
  })
}

function saveCart(){
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
    return sum + (p.price * it.qty)
  },0)
  countEl.textContent = cart.reduce((s,i)=>s+i.qty,0)
  itemsEl.innerHTML = '';
  if(cart.length===0){ itemsEl.innerHTML = '<li>Seu carrinho está vazio.</li>' }
  cart.forEach(it=>{
    const p = products.find(pp=>pp.id===it.id);
    const li = document.createElement('li'); li.className='cart-item';
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
      </div>`;
    li.querySelector('.dec').onclick = ()=> changeQty(it.id, -1);
    li.querySelector('.inc').onclick = ()=> changeQty(it.id, +1);
    li.querySelector('.rem').onclick = ()=> removeFromCart(it.id);
    itemsEl.appendChild(li)
  })
  totalEl.textContent = formatPrice(total)
}

// Checkout via WhatsApp
function checkoutWhatsApp(){
  if(!vendorPhone){ alert('Configure o número do vendedor em app.js (variável vendorPhone).'); return }
  if(cart.length===0){ alert('Seu carrinho está vazio.'); return }
  const customerNameEl = document.getElementById('customer-name');
  const name = customerNameEl ? customerNameEl.value.trim() : '';
  if(!name){ alert('Por favor, preencha seu nome antes de finalizar.'); customerNameEl && customerNameEl.focus(); return }
  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const payment = paymentEl ? paymentEl.value : 'Não informado';
  let msg = `Olá, meu nome é ${encodeURIComponent(name)}. Gostaria de finalizar a compra:%0A`;
  msg += `%0AForma de pagamento: ${encodeURIComponent(payment)}%0A%0A`;
  cart.forEach(it=>{
    const p = products.find(pp=>pp.id===it.id);
    msg += `- ${encodeURIComponent(p.name)} x ${it.qty} = R$ ${formatPrice(p.price * it.qty)}%0A`;
  })
  const total = cart.reduce((s,it)=> s + products.find(p=>p.id===it.id).price * it.qty, 0)
  msg += `%0ATotal: R$ ${formatPrice(total)}`;
  const url = `https://wa.me/${vendorPhone}?text=${msg}`;
  window.open(url, '_blank');
}

// Eventos
document.addEventListener('DOMContentLoaded', ()=>{
  // EXISTE JÁ:
  renderCategories();
  renderProducts();
  updateCartUI();

  // >>>> ADICIONAR ISSO <<<<
  const catToggle = document.getElementById('cat-toggle');
  const catList = document.getElementById('categories');

  catToggle.onclick = () => {
    catList.classList.toggle('open');
    catToggle.textContent = catList.classList.contains('open')
      ? "Categorias "
      : "Categorias ";
  };

  $('#open-cart').onclick = ()=>{ $('#cart-modal').classList.remove('hidden') }
  $('#close-cart').onclick = ()=>{ $('#cart-modal').classList.add('hidden') }
  $('#checkout-wpp').onclick = checkoutWhatsApp
  $('#search').addEventListener('input', ()=>{
    const catBtn = document.querySelector('#categories button.active');
    const cat = catBtn && catBtn.textContent !== 'Todos' ? catBtn.textContent : null;
    renderProducts(cat, $('#search').value.trim())
  })
});