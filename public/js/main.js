const API_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api'
    : 'https://flipkart1-0xel.onrender.com/api';

let currentPage = 1;
let currentCategory = null;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
    loadDeals();
    // loadCartCount();
    initCarousel();
    initSearch();
    initCategories();
    updateCartCount();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    updateAuthUI(!!token, user);
}

function updateAuthUI(isLoggedIn, user) {
    const authText = document.getElementById('authText');
    const userMenuItems = document.getElementById('userMenuItems');

    if (isLoggedIn && user) {
        authText.textContent = user.name;
        userMenuItems.innerHTML = `
            <div class="dropdown-item" onclick="window.location.href='checkout.html'">
                <i class="fas fa-box"></i>
                <span>My Orders</span>
            </div>
            <div class="dropdown-item" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </div>
        `;
    } else {
        authText.textContent = 'Login';
        userMenuItems.innerHTML = `
            <div class="dropdown-item" onclick="window.location.href='login.html'">
                <i class="fas fa-sign-in-alt"></i>
                <span>Login</span>
            </div>
            <div class="dropdown-item" onclick="window.location.href='signup.html'">
                <i class="fas fa-user-plus"></i>
                <span>Sign Up</span>
            </div>
        `;
    }
}

function handleAuthClick() {
    const token = localStorage.getItem('token');
    if (token) toggleDropdown();
    else window.location.href = 'login.html';
}

function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('active');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully!');
    checkAuth();
    loadCartCount();
}

document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('userDropdown');
    const loginSection = document.querySelector('.login-section');
    if (!loginSection.contains(e.target)) dropdown.classList.remove('active');
});

async function loadProducts(reset = true) {
    if (reset) currentPage = 1;

    const grid = document.getElementById('allProductsGrid');
    grid.innerHTML = '<div class="loading"></div>';

    try {
        let url = `${API_URL}/products?page=${currentPage}&limit=20`;

        if (currentCategory) url += `&category=${currentCategory}`;
        if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            if (reset) grid.innerHTML = '';
            renderProducts(data.products, grid);

            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (!data.pagination || data.pagination.currentPage >= data.pagination.totalPages) {
                loadMoreBtn.style.display = 'none';
            } else loadMoreBtn.style.display = 'inline-block';
        } else {
            grid.innerHTML = `<p style="text-align:center;color:#666;">No products found.</p>`;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = `<p style="text-align:center;color:#666;">Failed to load products. Please check backend or try later.</p>`;
    }
}

async function loadDeals() {
    const grid = document.getElementById('dealsGrid');
    grid.innerHTML = '<div class="loading"></div>';

    try {
        const response = await fetch(`${API_URL}/products?limit=8`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            grid.innerHTML = '';
            renderProducts(data.products, grid);
        } else {
            grid.innerHTML = `<p style="text-align:center;color:#666;">No deals found.</p>`;
        }
    } catch (error) {
        console.error('Error loading deals:', error);
        grid.innerHTML = `<p style="text-align:center;color:#666;">Failed to load deals.</p>`;
    }
}
// async function loadCartCount() {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//         const res = await fetch(`${API_URL}/cart`, {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         });
//         const data = await res.json();
//         if (data.success) {
//             const count = data.cartItems.reduce((sum, item) => sum + item.quantity, 0);
//             document.getElementById("cartCount").innerText = count;
//         }
//     } catch (err) {
//         console.error("Cart count error:", err);
//     }
// }

function renderProducts(products, container) {
    products.forEach(product => {
        const discount = product.discount_price
            ? Math.round(((product.price - product.discount_price) / product.price) * 100)
            : 0;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="product-image"
                 onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand || 'Generic Brand'}</p>
                <div class="product-price">
                    <span class="current-price">₹${(product.discount_price || product.price).toLocaleString()}</span>
                    ${product.discount_price ? `
                        <span class="original-price">₹${product.price.toLocaleString()}</span>
                        <span class="discount">${discount}% off</span>
                    ` : ''}
                </div>
                <div class="product-rating">
                    ${product.rating || 4.2} <i class="fas fa-star"></i>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;

        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart-btn')) {
                window.location.href = `product.html?id=${product.id}`;
            }
        });

        container.appendChild(card);
    });
}

function loadMoreProducts() {
    currentPage++;
    loadProducts(false);
}

async function addToCart(productId) {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "login.html";
        return;
    }
    try {
        const res = await fetch(`${API_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        const data = await res.json();
        if (data.success) {
            showToast("Product added to cart");
            updateCartCount();
        } else {
            showToast("Failed to add to cart");
        }
    } catch (err) {
        console.error("Add to cart error:", err);
        showToast("Network error");
    }
}

async function updateCartCount() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/cart`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (data.success) {
            const count = data.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById("cartCount").innerText = count;
        }
    } catch (err) {
        console.error(err);
    }
}
let currentSlide = 0;
let slideInterval;

function initCarousel() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('carouselDots');
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
    startAutoSlide();
}

function changeSlide(direction) { currentSlide = (currentSlide + direction + document.querySelectorAll('.slide').length) % document.querySelectorAll('.slide').length; updateCarousel(); resetAutoSlide(); }
function goToSlide(index) { currentSlide = index; updateCarousel(); resetAutoSlide(); }
function updateCarousel() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
function startAutoSlide() { slideInterval = setInterval(() => changeSlide(1), 5000); }
function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = this.value.trim();
            loadProducts();
        }, 300);
    });
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { currentSearch = this.value.trim(); loadProducts(); }
    });
}

function initCategories() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryId = this.dataset.category;
            if (currentCategory === categoryId) { currentCategory = null; this.classList.remove('active'); }
            else { categoryItems.forEach(i => i.classList.remove('active')); currentCategory = categoryId; this.classList.add('active'); }
            loadProducts();
            document.querySelector('.all-products-section').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}






