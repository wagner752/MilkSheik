// Função para verificar se a loja está aberta
function verificarStatusLoja() {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado
    const hora = agora.getHours();

    const lojaAberta =
        diaSemana >= 1 && diaSemana <= 5 && // Segunda a sexta
        hora >= 8 && hora < 18; // 08h às 18h

    const statusDiv = document.getElementById("StatusLoja");

    if (lojaAberta) {
        statusDiv.style.backgroundColor = "#16A249"; // Verde
        statusDiv.textContent = "Terça à Sexta - 14h às 00h";
    } else {
        statusDiv.style.backgroundColor = "red"; // Vermelho
        statusDiv.textContent = "Terça à Sexta - 14h às 00h";
    }
}

async function fetchProductsFromGoogleSheets(sheetUrl) {
    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();

        // Converte o CSV em um array de objetos
        const rows = csvText.split('\n').slice(1); // Ignora o cabeçalho
        return rows.map(row => {
            const [id, name, priceP, priceM, priceG, image] = row.split(','); // Divide por vírgula
            return {
                id: id.trim(),
                name: name.trim(),
                priceP: parseFloat(priceP.trim()), // Preço para P
                priceM: parseFloat(priceM.trim()), // Preço para M
                priceG: parseFloat(priceG.trim()), // Preço para G
                image: image.trim(),
            };
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
}

let cart = [];  // Array que guarda os produtos no carrinho
let filteredProducts = []
let preferidosSheikProducts = []; // Produtos da seção Preferidos do Sheik
let linhaKidsProducts = []; // Produtos da seção Linha Kids
let sheikAlcoolicoProducts = []; // Produtos da seção Shakes Alcoólicos
let savedWhatsAppNumber = ""; // Variável global para armazenar o número do WhatsApp

// Função que adiciona produtos ao carrinho
function addToCart(productId, quantity, name, price) {
    // Verifica se o produto já está no carrinho
    const existingProductIndex = cart.findIndex(item => item.id === productId);
    
    if (existingProductIndex !== -1) {
        // Se já estiver, atualiza a quantidade
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Se não estiver, adiciona um novo produto
        cart.push({ id: productId, name: name, price: price, quantity: quantity });
    }

    // Atualiza a visualização do carrinho
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Limpa os itens do carrinho

    let total = 0; // Inicializa o total

    // Verifica se há itens no carrinho
    if (cart.length === 0) {
        cartItems.innerHTML = "<li>Seu carrinho está vazio.</li>";
    } else {
        // Renderiza os itens no carrinho e soma os valores
        cart.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${item.name} (${item.tamanho}) - R$ ${(item.price * item.quantity).toFixed(2)} 
                (Quantidade: ${item.quantity})
                <button data-id="${item.id}" data-tamanho="${item.tamanho}" class="remove-from-cart-btn btn btn-danger btn-sm">Remover</button>
            `;
            cartItems.appendChild(listItem);
            total += item.price * item.quantity; // Soma o valor ao total
        });
    }
    // Exibe o total no carrinho
    const totalElement = document.getElementById('cart-total');
    totalElement.textContent = `Total: R$ ${total.toFixed(2)}`; // Atualiza o total no HTML

    // Habilita os botões de limpeza e finalização
    document.getElementById('clear-cart').disabled = cart.length === 0;
    document.getElementById('finalize-cart').disabled = cart.length === 0;
}

// Função para remover item do carrinho
function removeFromCart(productId, tamanho) {
    const index = cart.findIndex(item => item.id === productId && item.tamanho === tamanho);
    if (index !== -1) {
        cart.splice(index, 1);  // Remove o item do carrinho
        renderCart();  // Atualiza a exibição do carrinho
    }
}

// Função para finalizar o pedido
function finalizeOrder() {
    alert("Pedido finalizado! Confirme o pedido no WhatsApp com a loja.");
    checkout(cart);
    cart = [];  // Limpa o carrinho após finalização
    renderCart();  // Atualiza a exibição do carrinho
}

// Função para limpar o carrinho
function clearCart() {
    cart = [];  // Limpa o carrinho
    renderCart();  // Atualiza a exibição do carrinho
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart-btn')) {
        const section = event.target.dataset.section; // Identifica a seção
        const productId = event.target.dataset.id;
        const productName = event.target.closest('.product-card').querySelector('h3').textContent;
        const quantity = parseInt(event.target.closest('.product-card').querySelector('.quantity-input').value);
        const tamanho = event.target.closest('.product-card').querySelector('.tamanho-input').value;

        let sectionProducts;
        switch (section) {
            case 'preferidosSheik':
                sectionProducts = preferidosSheikProducts;
                break;
            case 'linhaKids':
                sectionProducts = linhaKidsProducts;
                break;
            case 'sheikAlcoolico':
                sectionProducts = sheikAlcoolicoProducts;
                break;
        }

        const product = sectionProducts.find(p => p.id === productId);

        if (!product) {
            alert("Produto não encontrado!");
            return;
        }

        let productPrice;
        switch (tamanho) {
            case 'P':
                productPrice = product.priceP;
                break;
            case 'M':
                productPrice = product.priceM;
                break;
            case 'G':
                productPrice = product.priceG;
                break;
        }

        if (quantity > 0) {
            addToCart(productId, quantity, tamanho, productName, productPrice);
        } else {
            alert("A quantidade precisa ser maior que zero.");
        }
    }
});

function addToCart(productId, quantity, tamanho, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId && item.tamanho === tamanho);
    if (existingItem) {
        // Atualiza a quantidade se o produto já estiver no carrinho
        existingItem.quantity += quantity;
    } else {
        // Adiciona o item ao carrinho
        cart.push({ id: productId, name: productName, price: productPrice, quantity, tamanho });
    }
    renderCart(); // Atualiza a exibição do carrinho
}

function preferidosSheikRender(products) {
    preferidosSheikProducts = products.slice(0); // Atualiza o array global
    const container = document.querySelector('.preferidosSheik .container');

    container.innerHTML = ''; // Limpa o container

    container.classList.add('g-3', 'justify-content-center');

    preferidosSheikProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card col-12 col-sm-6 col-md-4 col-lg-3';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="img-fluid">
            <h3>${product.name}</h3>
            <p class="price">R$ ${product.priceM.toFixed(2)}</p>
            <div class="d-flex align-items-center">
                <input type="number" class="quantity-input form-control" min="1" value="1">
                <select class="tamanho-input">
                    <option value="P">P</option>
                    <option value="M" selected>M</option>
                    <option value="G">G</option>
                </select>
                <button data-id="${product.id}" data-section="preferidosSheik" class="add-to-cart-btn btn btn-primary ms-2">Adicionar</button>
            </div>
        `;
        container.appendChild(productCard);

        const selectElement = productCard.querySelector('.tamanho-input');
        const priceElement = productCard.querySelector('.price');

        selectElement.addEventListener('change', (event) => {
            const selectedSize = event.target.value;

            let updatedPrice;
            switch (selectedSize) {
                case 'P':
                    updatedPrice = product.priceP;
                    break;
                case 'M':
                    updatedPrice = product.priceM;
                    break;
                case 'G':
                    updatedPrice = product.priceG;
                    break;
            }
            priceElement.textContent = `R$ ${updatedPrice.toFixed(2)}`;
        });
    });
}

function linhaKidsRender(products) {
    linhaKidsProducts = products.slice(0); // Atualiza o array global
    const container = document.querySelector('.linhaKids .container');

    container.innerHTML = ''; // Limpa o container

    container.classList.add('g-3', 'justify-content-center');

    linhaKidsProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card col-12 col-sm-6 col-md-4 col-lg-3';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="img-fluid">
            <h3>${product.name}</h3>
            <p class="price">R$ ${product.priceM.toFixed(2)}</p>
            <div class="d-flex align-items-center">
                <input type="number" class="quantity-input form-control" min="1" value="1">
                <select class="tamanho-input">
                    <option value="P">P</option>
                    <option value="M" selected>M</option>
                    <option value="G">G</option>
                </select>
                <button data-id="${product.id}" data-section="linhaKids" class="add-to-cart-btn btn btn-primary ms-2">Adicionar</button>
            </div>
        `;
        container.appendChild(productCard);

        const selectElement = productCard.querySelector('.tamanho-input');
        const priceElement = productCard.querySelector('.price');

        selectElement.addEventListener('change', (event) => {
            const selectedSize = event.target.value;

            let updatedPrice;
            switch (selectedSize) {
                case 'P':
                    updatedPrice = product.priceP;
                    break;
                case 'M':
                    updatedPrice = product.priceM;
                    break;
                case 'G':
                    updatedPrice = product.priceG;
                    break;
            }
            priceElement.textContent = `R$ ${updatedPrice.toFixed(2)}`;
        });
    });
}

function sheikAlcoolicoRender(products) {
    sheikAlcoolicoProducts = products.slice(0); // Atualiza o array global específico
    const container = document.querySelector('.sheikAlcoolico .container'); // Seleciona o container da seção Shakes Alcoólicos

    // Limpa qualquer conteúdo anterior dentro do container
    container.innerHTML = '';

    // Adiciona as classes "row", "g-3", e "justify-content-center" para centralizar
    container.classList.add('g-3', 'justify-content-center');

    // Adiciona cada produto ao container
    sheikAlcoolicoProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card col-12 col-sm-6 col-md-4 col-lg-3'; // 4 produtos por linha no tamanho grande
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="img-fluid">
            <h3>${product.name}</h3>
            <p class="price">R$ ${product.priceM.toFixed(2)}</p> <!-- Preço inicial é Médio (M) -->
            <div class="d-flex align-items-center">
                <input type="number" class="quantity-input form-control" min="1" value="1">
                <select class="tamanho-input">
                    <option value="P">P</option>
                    <option value="M" selected>M</option> <!-- Define Médio como padrão -->
                    <option value="G">G</option>
                </select>
                <button data-id="${product.id}" data-section="sheikAlcoolico" class="add-to-cart-btn btn btn-primary ms-2">Adicionar</button>
            </div>
        `;

        container.appendChild(productCard);

        // Adiciona o evento para alterar o preço dinamicamente ao selecionar o tamanho
        const selectElement = productCard.querySelector('.tamanho-input');
        const priceElement = productCard.querySelector('.price');

        selectElement.addEventListener('change', (event) => {
            const selectedSize = event.target.value;

            // Atualiza o preço conforme o tamanho escolhido
            let updatedPrice;
            switch (selectedSize) {
                case 'P':
                    updatedPrice = product.priceP;
                    break;
                case 'M':
                    updatedPrice = product.priceM;
                    break;
                case 'G':
                    updatedPrice = product.priceG;
                    break;
            }
            priceElement.textContent = `R$ ${updatedPrice.toFixed(2)}`;
        });
    });
}

function checkout(cart) {
    savedWhatsAppNumber = "+5584991652870"

  // Verifica se o número do WhatsApp foi configurado
  if (!savedWhatsAppNumber) {
    alert("Por favor, configure o número de WhatsApp antes de finalizar o pedido.");
    return;
  }

  // Mensagem padrão para o WhatsApp
  let message = "Olá, gostaria de fazer um pedido, fiz a seleção pelo site desses itens:%0A";
  
  // Adiciona os itens do carrinho à mensagem
  cart.forEach((item) => {
    message += `- ${item.name} (x${item.quantity}): R$ ${(item.price * item.quantity).toFixed(2)}%0A`;
  });

  // Calcula o total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  message += `%0ATotal: R$ ${total.toFixed(2)}`;

  message += "%0AAguardo seu retorno";

  // Cria o link do WhatsApp com o número e a mensagem
  const url = `https://wa.me/${savedWhatsAppNumber.replace('+', '')}?text=${message}`;
  window.open(url, "_blank");
}

document.addEventListener('DOMContentLoaded', async () => {
    const products = await fetchProductsFromGoogleSheets('https://docs.google.com/spreadsheets/d/e/2PACX-1vS2VP2o7HF3OPrFIwMYL3tkT673vZ4gQOUhSn9G8-z0apAhm1r0b07hoF9wZW_U51ct5B-I5LaZ9ySE/pub?gid=0&single=true&output=csv');
    const preferidosSheik = await fetchProductsFromGoogleSheets('https://docs.google.com/spreadsheets/d/e/2PACX-1vQIaVHo-KqxejaAZxWn7BMol-KKfpLq56Su2tL5UyOFiwjPLMEisWHz--Zgs2O_KVIofJzw0LYuBd3a/pub?output=csv');
    const linhaKids = await fetchProductsFromGoogleSheets('https://docs.google.com/spreadsheets/d/e/2PACX-1vSSgsdx1GwYzSk_yd_goSGlIdWU3QH1i2JhP4nRpEI-2ivDAu-H-iCiX2RKZ09gEVcQv9SeHa1R01rl/pub?output=csv');
    const sheikAlcoolico = await fetchProductsFromGoogleSheets('https://docs.google.com/spreadsheets/d/e/2PACX-1vT3Udb6rBkOYu1EqvXOqyZ4G_vbsNa1mXEsKKlQIu4FLZMhnHKKkOq5Rq8RXa3amh32DBzjNXAC-4v8/pub?output=csv');
    preferidosSheikRender(preferidosSheik); // Passa os produtos para a função demaisProdutos
    linhaKidsRender(linhaKids);
    sheikAlcoolicoRender(sheikAlcoolico);
    renderCart();
    verificarStatusLoja();    
    
    const toggleButton = document.getElementById("toggle-cart");
    const cartContainer = document.getElementById("cart-container");

    toggleButton.addEventListener("click", () => {
        const isCollapsed = cartContainer.classList.toggle("collapsed");
        toggleButton.innerHTML = isCollapsed
            ? '<i class="bi bi-arrows-collapse"></i>' // Ícone para expandir
            : '<i class="bi bi-arrows-expand"></i>';  // Ícone para colapsar
    });
});

document.getElementById('clear-cart').addEventListener('click', clearCart);
document.getElementById('finalize-cart').addEventListener('click', finalizeOrder);