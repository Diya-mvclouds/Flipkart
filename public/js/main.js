const API_URL = 'http://localhost:3000/api';
let currentPage = 1;
let currentCategory = null;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
    loadDeals();
    loadCartCount();
    initCarousel();
    initSearch();
    initCategories();
});


function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    updateAuthUI(!!token, user);
}

function updateAuthUI(isLoggedIn, user) {
    const loginBtn = document.getElementById('loginBtn');
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
    if (token) {
        toggleDropdown();
    } else {
        window.location.href = 'login.html';
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
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
    
    if (!loginSection.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

async function loadProducts(reset = true) {
    if (reset) {
        currentPage = 1;
    }
    
    const grid = document.getElementById('allProductsGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        let url = `${API_URL}/products?page=${currentPage}&limit=20`;
        
        if (currentCategory) {
            url += `&category=${currentCategory}`;
        }
        
        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            if (reset) {
                grid.innerHTML = '';
            }
            
            renderProducts(data.products, grid);
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (data.pagination.currentPage >= data.pagination.totalPages) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p style="text-align: center; color: #666;">Failed to load products. Please try again.</p>';
    }
}

async function loadDeals() {
    const grid = document.getElementById('dealsGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await fetch(`${API_URL}/products?limit=8`);
        const data = await response.json();
        
        if (data.success) {
            grid.innerHTML = '';
            renderProducts(data.products, grid);
        }
    } catch (error) {
        console.error('Error loading deals:', error);
    }
}

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

async function addToCart(productId, event) {
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        showToast('Please login to add items to cart!');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Product added to cart!');
            loadCartCount();
        } else {
            showToast(data.message || 'Failed to add to cart');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showToast('Failed to add to cart');
    }
}

async function loadCartCount() {
    const token = localStorage.getItem('token');
    const cartCountEl = document.getElementById('cartCount');
    
    if (!token) {
        cartCountEl.textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const count = data.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountEl.textContent = count;
        }
    } catch (error) {
        console.error('Error loading cart count:', error);
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

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    currentSlide += direction;
    
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    updateCarousel();
    resetAutoSlide();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetAutoSlide();
}

function updateCarousel() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}


function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = this.value.trim();
            if (currentSearch.length >= 2) {
                loadProducts();
            } else if (currentSearch.length === 0) {
                loadProducts();
            }
        }, 300);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentSearch = this.value.trim();
            loadProducts();
        }
    });
}


function initCategories() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryId = this.dataset.category;
            
            if (currentCategory === categoryId) {
                currentCategory = null;
                this.classList.remove('active');
            } else {
                categoryItems.forEach(i => i.classList.remove('active'));
                currentCategory = categoryId;
                this.classList.add('active');
            }
            
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
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}