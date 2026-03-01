/**
 * main.js — Master Theme Shopify Hybride
 * Entry point: Alpine.js initialization + global stores
 *
 * Bundle target: < 25 Ko gzip (Alpine 3.x ≈ 15 Ko + custom stores ≈ 3-5 Ko)
 */

import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';
import './main.css';

// ─── Alpine Plugins ───────────────────────────────────────────────────────────
Alpine.plugin(intersect);

// ─── Store: Cart ──────────────────────────────────────────────────────────────
// Manages Shopify cart state via AJAX API. Single source of truth for all
// cart UI components (drawer, sticky ATC, header badge).
Alpine.store('cart', {
  open: false,
  items: [],
  itemCount: 0,
  total: 0,
  currency: 'EUR',
  loading: false,

  /** Fetch current cart state from Shopify */
  async init() {
    await this.fetch();
  },

  async fetch() {
    try {
      const res = await fetch('/cart.js', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      this.items = data.items;
      this.itemCount = data.item_count;
      this.total = data.total_price;
      this.currency = data.currency;
    } catch (err) {
      console.error('[cart] fetch error:', err);
    }
  },

  /**
   * Add a variant to the cart
   * @param {number} variantId - Shopify variant ID
   * @param {number} quantity - defaults to 1
   * @param {object} properties - line item properties
   */
  async add(variantId, quantity = 1, properties = {}) {
    this.loading = true;
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity, properties }),
      });
      if (!res.ok) throw new Error(`Cart add failed: ${res.status}`);
      await this.fetch();
      this.open = true;
    } catch (err) {
      console.error('[cart] add error:', err);
    } finally {
      this.loading = false;
    }
  },

  /**
   * Update quantity for a line item by key
   * @param {string} key - cart item key (variantId:properties)
   * @param {number} quantity - new quantity (0 = remove)
   */
  async update(key, quantity) {
    this.loading = true;
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity }),
      });
      await this.fetch();
    } catch (err) {
      console.error('[cart] update error:', err);
    } finally {
      this.loading = false;
    }
  },

  /** Remove a line item entirely */
  async remove(key) {
    await this.update(key, 0);
  },

  get isEmpty() {
    return this.items.length === 0;
  },

  /** Format total price as currency string */
  formattedTotal() {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency || 'EUR',
    }).format(this.total / 100);
  },
});

// ─── Store: UI ────────────────────────────────────────────────────────────────
// Global UI state: mobile menu, overlays, etc.
Alpine.store('ui', {
  mobileMenuOpen: false,
  searchOpen: false,

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  },

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  },

  toggleSearch() {
    this.searchOpen = !this.searchOpen;
  },
});

// ─── Alpine component: Variant Picker ─────────────────────────────────────────
// Handles variant selection, price/image/stock updates reactively.
Alpine.data('variantPicker', (productJson) => ({
  product: productJson,
  selectedOptions: {},
  selectedVariant: null,
  quantity: 1,
  loading: false,

  init() {
    // Pre-select first available variant
    const firstVariant = this.product.variants.find((v) => v.available)
      || this.product.variants[0];

    if (firstVariant) {
      this.selectedVariant = firstVariant;
      firstVariant.options.forEach((value, idx) => {
        const optionName = this.product.options[idx];
        this.selectedOptions[optionName] = value;
      });
    }
  },

  selectOption(name, value) {
    this.selectedOptions[name] = value;
    this.updateVariant();
  },

  updateVariant() {
    const match = this.product.variants.find((v) =>
      v.options.every(
        (val, idx) => val === this.selectedOptions[this.product.options[idx]]
      )
    );
    this.selectedVariant = match || null;

    // Dispatch event for Sticky ATC and other listeners
    document.dispatchEvent(
      new CustomEvent('variant:change', { detail: { variant: this.selectedVariant } })
    );
  },

  get price() {
    if (!this.selectedVariant) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'EUR',
    }).format(this.selectedVariant.price / 100);
  },

  get comparePrice() {
    if (!this.selectedVariant?.compare_at_price) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'EUR',
    }).format(this.selectedVariant.compare_at_price / 100);
  },

  get available() {
    return this.selectedVariant ? this.selectedVariant.available : false;
  },

  get savingsPercent() {
    if (!this.selectedVariant?.compare_at_price) return null;
    const savings =
      ((this.selectedVariant.compare_at_price - this.selectedVariant.price) /
        this.selectedVariant.compare_at_price) *
      100;
    return Math.round(savings);
  },

  isOptionAvailable(optionName, value) {
    const testOptions = { ...this.selectedOptions, [optionName]: value };
    return this.product.variants.some(
      (v) =>
        v.available &&
        v.options.every(
          (val, idx) => val === testOptions[this.product.options[idx]]
        )
    );
  },

  async addToCart() {
    if (!this.available || !this.selectedVariant) return;
    this.loading = true;
    await Alpine.store('cart').add(this.selectedVariant.id, this.quantity);
    this.loading = false;
  },

  increaseQty() {
    this.quantity = Math.min(this.quantity + 1, 99);
  },

  decreaseQty() {
    this.quantity = Math.max(this.quantity - 1, 1);
  },
}));

// ─── Alpine component: Accordion ──────────────────────────────────────────────
// Reusable for FAQ, product description accordion, etc.
Alpine.data('accordion', () => ({
  activeItem: null,

  toggle(id) {
    this.activeItem = this.activeItem === id ? null : id;
  },

  isOpen(id) {
    return this.activeItem === id;
  },
}));

// ─── Alpine component: Sticky ATC ─────────────────────────────────────────────
// Observes #main-atc-btn via IntersectionObserver. Shows the sticky bar
// when the main button scrolls out of view on product pages.
Alpine.data('stickyAtc', () => ({
  visible: false,
  variant: null,

  init() {
    const sentinel = document.getElementById('main-atc-btn');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        this.visible = !entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);

    // Keep variant in sync with the variant picker
    document.addEventListener('variant:change', (e) => {
      this.variant = e.detail.variant;
    });
  },

  get available() {
    return this.variant ? this.variant.available : true;
  },

  async addToCart() {
    if (!this.available || !this.variant) return;
    await Alpine.store('cart').add(this.variant.id, 1);
  },
}));

// ─── Start Alpine ─────────────────────────────────────────────────────────────
// Must be called after all stores and components are registered.
window.Alpine = Alpine;
Alpine.start();
