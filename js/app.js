// ——— DATOS DE PRODUCTOS ———
const pizzas = [
  {
    id: 'p2',
    name: 'Pepperoni',
    price: 1400,
    description: 'Salsa de tomate, mozzarella y pepperoni',
    image:
      'https://media.istockphoto.com/id/1349560402/photo/pepperoni-pizza-with-a-slice-taken-out-with-cheese-pull.jpg?s=612x612&w=0&k=20&c=KYmvPu2uRk9BAIufw20eSQ80wuhSSCp4ZozbslVWLBM=',
  },
  {
    id: 'p1',
    name: 'Margarita',
    price: 1200,
    description: 'Salsa de tomate, mozzarella, albahaca fresca y aceite de oliva',
    image: 'https://cookingitalians.com/wp-content/uploads/2024/11/Margherita-Pizza.jpg',
  },
  {
    id: 'p3',
    name: 'Cuatro Quesos',
    price: 1500,
    description: 'Mozzarella, provolone, parmesano y gorgonzola',
    image: 'https://cdn.pixabay.com/photo/2020/06/17/21/46/pizza-5311269_640.jpg',
  },
  {
    id: 'p4',
    name: 'Vegetariana',
    price: 1300,
    description: 'Mozzarella, cebolla, espinaca, y salsa blanca',
    image: 'https://cdn.pixabay.com/photo/2012/12/24/08/38/spinach-72123_640.jpg',
  },
];

const empanadas = [
  {
    id: 'e1',
    name: 'Carne Suave',
    price: 350,
    description: 'Carne picada, cebolla, huevo duro y aceitunas',
    image: 'https://www.cilantroparsley.com/wp-content/uploads/2021/09/E2FCF41A-1F2C-4EF8-A39E-162AA3503CFA.jpeg',
  },
  {
    id: 'e2',
    name: 'Carne Picante',
    price: 350,
    description: 'Carne picada, cebolla, ají molido, huevo duro y aceitunas',
    image: 'https://www.chainbaker.com/wp-content/uploads/2021/08/IMG_0943.jpg',
  },
  {
    id: 'e3',
    name: 'Jamón y Queso',
    price: 300,
    description: 'Jamón cocido y mozzarella',
    image: 'https://www.clarin.com/img/2021/04/12/WYz8Yr8tB_1256x620__1.jpg',
  },
  {
    id: 'e4',
    name: 'Pollo',
    price: 320,
    description: 'Pollo desmenuzado, cebolla, morrón y especias',
    image: 'https://noshingwiththenolands.com/wp-content/uploads/2025/01/Chicken-Empanadas-35-1536x1024.jpg',
  },
];

// ——— VARIABLE GLOBAL DEL CARRITO ———
let cart = [];

// ——— INICIALIZAR ALCANCE DEL DOCUMENTO ———
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCartFromStorage();
  setupEventListeners();
  updateCartCount();
});

// ——— FUNCIONES ———

/**
 * Carga las tarjetas de productos en sus respectivos contenedores.
 */
function loadProducts() {
  const pizzasContainer = document.getElementById('pizzas-container');
  const empanadasContainer = document.getElementById('empanadas-container');

  pizzas.forEach((pizza) => {
    pizzasContainer.appendChild(createProductCard(pizza));
  });

  empanadas.forEach((empanada) => {
    empanadasContainer.appendChild(createProductCard(empanada));
  });
}

/**
 * Crea el elemento DOM con la tarjeta de producto.
 * @param {Object} product - Producto con propiedades id, name, price, description, image
 * @returns {HTMLElement} - Elemento div con la tarjeta
 */
function createProductCard(product) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-3';

  col.innerHTML = `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
      </div>
      <div class="product-info">
        <h4 class="product-title">${product.name}</h4>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <p class="product-description">${product.description}</p>
        <button class="add-to-cart" data-id="${product.id}">
          <i class="fas fa-plus"></i> Agregar al Carrito
        </button>
      </div>
    </div>
  `;
  return col;
}

/**
 * Configura los event listeners para la interacción.
 */
function setupEventListeners() {
  // Manejo de clicks generales (delegación)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart')) {
      const id = e.target.closest('.add-to-cart').dataset.id;
      addToCart(id);
    }

    if (e.target.closest('#cart-icon')) {
      document.getElementById('cart-modal').classList.add('show');
      renderCart();
    }

    if (e.target.closest('#close-cart')) {
      document.getElementById('cart-modal').classList.remove('show');
    }

    if (e.target.closest('.increase-quantity')) {
      increaseQuantity(+e.target.dataset.index);
    }

    if (e.target.closest('.decrease-quantity')) {
      decreaseQuantity(+e.target.dataset.index);
    }

    if (e.target.closest('.remove-item')) {
      removeFromCart(+e.target.dataset.index);
    }

    if (e.target.closest('#checkout-btn')) {
      checkout();
    }
  });

  // Scroll suave para anclas internas
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: 'smooth',
        });
      }
    });
  });

  // Enviar formulario de contacto (si existe)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await sendContactForm(contactForm);
    });
  }

  // Cerrar modal al hacer click fuera del contenido
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('cart-modal');
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

/**
 * Añade un producto al carrito o aumenta cantidad si ya está.
 * @param {string} productId - ID del producto a añadir
 */
function addToCart(productId) {
  const product =
    pizzas.find((p) => p.id === productId) ||
    empanadas.find((e) => e.id === productId);
  if (!product) return;

  const index = cart.findIndex((item) => item.id === productId);
  if (index !== -1) {
    cart[index].quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCartToStorage();
  updateCartCount();
  animateCartIcon();
}

/**
 * Animación breve para icono carrito al agregar.
 */
function animateCartIcon() {
  const cartIcon = document.getElementById('cart-icon');
  cartIcon.style.transform = 'scale(1.2)';
  setTimeout(() => (cartIcon.style.transform = 'scale(1)'), 200);
}

/**
 * Renderiza el contenido del carrito dentro del modal.
 */
function renderCart() {
  const container = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');

  container.innerHTML = '';

  if (cart.length === 0) {
    empty.classList.remove('d-none');
    footer.classList.add('d-none');
    return;
  }

  empty.classList.add('d-none');
  footer.classList.remove('d-none');

  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
      <div class="cart-item-details">
        <h5>${item.name}</h5>
        <p>$${item.price.toFixed(2)}</p>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease-quantity" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn increase-quantity" data-index="${index}">+</button>
          <i class="fas fa-trash ms-3 remove-item" data-index="${index}"></i>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  updateCartTotal();
}

/**
 * Incrementa cantidad del producto en carrito.
 * @param {number} index - índice en carrito
 */
function increaseQuantity(index) {
  cart[index].quantity++;
  saveCartToStorage();
  updateCartCount();
  renderCart();
}

/**
 * Decrementa cantidad del producto en carrito o elimina si queda 0.
 * @param {number} index - índice en carrito
 */
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    removeFromCart(index);
    return;
  }
  saveCartToStorage();
  updateCartCount();
  renderCart();
}

/**
 * Elimina producto del carrito.
 * @param {number} index - índice en carrito
 */
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  updateCartCount();
  renderCart();
}

/**
 * Actualiza el total del carrito en el modal.
 */
function updateCartTotal() {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  document.getElementById('cart-total-price').textContent = `$${total.toFixed(2)}`;
}

/**
 * Actualiza la cuenta de items en el icono carrito.
 */
function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  cartCount.textContent = count;
  cartCount.style.display = count === 0 ? 'none' : 'flex';
}

/**
 * Guarda el carrito en localStorage.
 */
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Carga el carrito desde localStorage.
 */
function loadCartFromStorage() {
  const saved = localStorage.getItem('cart');
  if (saved) cart = JSON.parse(saved);
}

/**
 * Función para manejar envío del formulario de contacto.
 * @param {HTMLFormElement} form - formulario de contacto
 */
async function sendContactForm(form) {
  const formAlert = document.getElementById('form-alert');
  const btn = form.querySelector('button[type="submit"]');
  const data = new FormData(form);

  const name = data.get('name');
  const email = data.get('email');
  const phone = data.get('phone');
  const message = data.get('message');

  // Validación simple
  if (!name || !email || !phone || !message) {
    formAlert.className = 'alert alert-danger';
    formAlert.textContent = 'Por favor completa todos los campos.';
    formAlert.classList.remove('d-none');
    return;
  }

  try {
    btn.disabled = true;
    btn.classList.add('btn-loading');

    const res = await fetch('https://formspree.io/f/myzjplov', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    });

    if (res.ok) {
      formAlert.className = 'alert alert-success';
      formAlert.textContent = 'Mensaje enviado correctamente.';
      form.reset();
    } else {
      throw new Error('Error en el envío');
    }
  } catch (err) {
    formAlert.className = 'alert alert-danger';
    formAlert.textContent = 'Error de conexión. Intenta más tarde.';
  } finally {
    formAlert.classList.remove('d-none');
    btn.disabled = false;
    btn.classList.remove('btn-loading');
    setTimeout(() => formAlert.classList.add('d-none'), 5000);
  }
}

/**
 * Proceso de finalizar compra (checkout).
 */
async function checkout() {
  const name = document.getElementById('checkout-name').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const alertBox = document.getElementById('checkout-alert');
  const modal = document.getElementById('cart-modal');
  const btn = document.getElementById('checkout-btn');

  // Validaciones básicas
  if (!name || !email || !phone) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = 'Por favor completa todos los datos de contacto.';
    alertBox.classList.remove('d-none');
    return;
  }

  if (cart.length === 0) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = 'Tu carrito está vacío.';
    alertBox.classList.remove('d-none');
    return;
  }

  // Detalles del pedido en texto
  const orderDetails = cart
    .map((item) => `${item.quantity} x ${item.name} ($${item.price.toFixed(2)} c/u)`)
    .join('\n');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Crear FormData para enviar
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('message', `Pedido:\n${orderDetails}\n\nTotal: $${total.toFixed(2)}`);
  formData.append('_replyto', email);

  btn.disabled = true;
  btn.textContent = 'Enviando...';
  alertBox.classList.add('d-none');

  try {
    const res = await fetch('https://formsubmit.co/jnl66966@gmail.com', {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      alertBox.className = 'alert alert-success';
      alertBox.textContent = '✅ ¡Tu pedido fue exitoso! Tu pedido está en camino 🍕🚚';
      alertBox.classList.remove('d-none');

      // Vaciar carrito y actualizar UI
      cart = [];
      saveCartToStorage();
      updateCartCount();
      renderCart();

      // Limpiar campos
      document.getElementById('checkout-name').value = '';
      document.getElementById('checkout-email').value = '';
      document.getElementById('checkout-phone').value = '';
    } else {
      throw new Error('Error en el servidor');
    }
  } catch (error) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = 'Error enviando el pedido. Por favor, intenta más tarde.';
    alertBox.classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Finalizar Compra';
    setTimeout(() => alertBox.classList.add('d-none'), 7000);
  }
}
