const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2VP2o7HF3OPrFIwMYL3tkT673vZ4gQOUhSn9G8-z0apAhm1r0b07hoF9wZW_U51ct5B-I5LaZ9ySE/pub?gid=0&single=true&output=csv';

const cart = [];

/*
// Inicializa o carrossel
// Atualiza o layout de produtos no carrossel
function initializeCarousel(products) {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const itemsPerView = 3;

    let currentPosition = 0;

    // Renderiza os produtos
    carousel.innerHTML = ''; // Limpa o carrossel antes de renderizar
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">R$ ${product.price}</p>
            <div class="d-flex align-items-center">
                <input type="number" class="quantity-input" min="1" value="1">
                <button data-id="${product.id}" class="add-to-cart-btn">Adicionar</button>
            </div>
        `;
        carousel.appendChild(productCard);
    });

    // Configuração de navegação
    const updateCarouselView = () => {
        const startIndex = currentPosition * itemsPerView;
        const endIndex = startIndex + itemsPerView;
        Array.from(carousel.children).forEach((card, index) => {
            card.style.display = index >= startIndex && index < endIndex ? 'block' : 'none';
        });
    };

    updateCarouselView();

    prevBtn.addEventListener('click', () => {
        currentPosition = Math.max(currentPosition - 1, 0);
        updateCarouselView();
    });

    nextBtn.addEventListener('click', () => {
        const maxPosition = Math.ceil(products.length / itemsPerView) - 1;
        currentPosition = Math.min(currentPosition + 1, maxPosition);
        updateCarouselView();
    });
}

*/



// Renderiza o carrinho na lateral
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    cart.forEach(product => {
        const item = document.createElement('li');
        item.innerHTML = `
            ${product.name} - R$ ${(product.price * product.quantity).toFixed(2)} 
            <button data-id="${product.id}" class="remove-from-cart-btn btn btn-danger btn-sm">X</button>
        `;
        cartItems.appendChild(item);
    });
}
// Função para verificar se a loja está aberta
function verificarStatusLoja() {
    console.log("Teste");
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado
    const hora = agora.getHours();

    // Verifica se a loja está aberta: Terça a Domingo, das 14h à meia-noite
    const lojaAberta =
        diaSemana >= 2 && diaSemana <= 7 && // Terça a Domingo
        hora >= 14 && hora < 24; // 14h às 24h (meia-noite)

    const statusDiv = document.getElementById("StatusLoja");

    if (lojaAberta) {
        statusDiv.style.backgroundColor = "#16A249"; // Verde
        statusDiv.textContent = "Terça à Domingo - 14h à meia-noite";
    } else {
        statusDiv.style.backgroundColor = "red"; // Vermelho
        statusDiv.textContent = "Terça à Domingo - 14h à meia-noite";
    }
}

  