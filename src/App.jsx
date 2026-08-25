import { useEffect, useMemo, useState } from 'react'
import { categories } from './data/products'
import { useStore } from './context/StoreContext'

const money = value => `$${value.toFixed(2)}`

const go = path => {
  window.location.hash = path
}

function Header() {
  const { cart, wishlist, user } = useStore()
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header>
      <a className="logo" href="#/">NORTHSTAR</a>

      <nav>
        <a href="#/shop">Shop</a>
        <a href="#/orders">Orders</a>
        {user?.isAdmin && <a href="#/admin">Admin</a>}
      </nav>

      <div className="nav-actions">
        <a href="#/wishlist" aria-label="Wishlist">
          ♡<small>{wishlist.length}</small>
        </a>

        <a href="#/cart" aria-label="Cart">
          Bag<small>{count}</small>
        </a>

        <a href={user ? '#/profile' : '#/login'}>
          {user ? user.name.split(' ')[0] : 'Sign in'}
        </a>
      </div>
    </header>
  )
}

function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore()

  return (
    <article className="product-card">
      <button
        className="wish"
        onClick={() => toggleWishlist(product.id)}
      >
        {wishlist.includes(product.id) ? '♥' : '♡'}
      </button>

      <a href={`#/product/${product.id}`}>
        <img src={product.image} alt={product.name} />

        <div className="product-info">
          <p>{product.category}</p>
          <h3>{product.name}</h3>

          <span>
            ★ {product.rating} <em>({product.reviews})</em>
          </span>

          <strong>{money(product.price)}</strong>
        </div>
      </a>

      <button
        className="add"
        onClick={() => addToCart(product)}
        disabled={!product.stock}
      >
        {product.stock ? 'Add to bag' : 'Out of stock'}
      </button>
    </article>
  )
}

function Shop({ initialCategory = 'All' }) {
  const { products } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  const visible = useMemo(() => {
    return products
      .filter(product => {
        const matchesCategory =
          category === 'All' || product.category === category

        const matchesSearch = product.name
          .toLowerCase()
          .includes(query.toLowerCase())

        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'low') return a.price - b.price
        if (sort === 'high') return b.price - a.price
        if (sort === 'rating') return b.rating - a.rating
        return a.id - b.id
      })
  }, [products, category, query, sort])

  return (
    <main className="shop">
      <div className="page-title">
        <p>Thoughtful things for everyday life</p>
        <h1>Shop all products</h1>
      </div>

      <div className="shop-tools">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products"
        />

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      <div className="categories">
        {categories.map(item => (
          <button
            key={item}
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="results">{visible.length} products</p>

      {visible.length ? (
        <div className="product-grid">
          {visible.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Nothing matched your search"
          text="Try a different word or category."
        />
      )}
    </main>
  )
}

function Home() {
  const { products } = useStore()

  return (
    <main>
      <section className="hero">
        <div>
          <p>NEW SEASON · 2026</p>
          <h1>
            Made for the
            <br />
            everyday.
          </h1>
          <span>Useful things, thoughtfully chosen.</span>
          <button onClick={() => go('/shop')}>
            Shop the collection
          </button>
        </div>
      </section>

      <section className="feature">
        <div>
          <p className="eyebrow">OUR FAVORITES</p>
          <h2>
            Well-made essentials
            <br />
            you’ll use on repeat.
          </h2>
          <a href="#/shop">Explore everything →</a>
        </div>

        <div className="product-grid">
          {products.slice(0, 3).map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      <section className="promise">
        <div>
          <b>01</b>
          <h3>Built to last</h3>
          <p>Quality materials and considered details.</p>
        </div>

        <div>
          <b>02</b>
          <h3>Easy returns</h3>
          <p>30 days to decide if it’s right for you.</p>
        </div>

        <div>
          <b>03</b>
          <h3>Small-batch finds</h3>
          <p>A collection with a point of view.</p>
        </div>
      </section>
    </main>
  )
}

function ProductPage({ id }) {
  const {
    products,
    addToCart,
    wishlist,
    toggleWishlist
  } = useStore()

  const product = products.find(item => item.id === Number(id))
  const [review, setReview] = useState('')
  const [reviews, setReviews] = useState([])

  if (!product) {
    return (
      <main>
        <Empty
          title="Product not found"
          text="It may have been removed from the catalogue."
        />
      </main>
    )
  }

  const submitReview = e => {
    e.preventDefault()

    if (!review.trim()) return

    setReviews([...reviews, review])
    setReview('')
  }

  return (
    <main className="detail">
      <img src={product.image} alt={product.name} />

      <div>
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>

        <div className="rating">
          ★ {product.rating}{' '}
          <span>
            ({product.reviews + reviews.length} reviews)
          </span>
        </div>

        <h2>{money(product.price)}</h2>

        <p className="description">{product.description}</p>

        <p className={product.stock ? 'in-stock' : 'out-stock'}>
          {product.stock
            ? `${product.stock} in stock`
            : 'Out of stock'}
        </p>

        <div className="detail-actions">
          <button
            className="primary"
            onClick={() => addToCart(product)}
            disabled={!product.stock}
          >
            Add to bag
          </button>

          <button
            className="secondary"
            onClick={() => toggleWishlist(product.id)}
          >
            {wishlist.includes(product.id) ? '♥ Saved' : '♡ Save'}
          </button>
        </div>

        <div className="reviews">
          <h3>Customer reviews</h3>

          {reviews.map((item, index) => (
            <p key={index}>★ ★ ★ ★ ★ &nbsp; {item}</p>
          ))}

          <form onSubmit={submitReview}>
            <input
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Write a short review"
            />
            <button>Post review</button>
          </form>
        </div>
      </div>
    </main>
  )
}

function Cart() {
  const { cart, updateQuantity } = useStore()

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  if (!cart.length) {
    return (
      <main>
        <Empty
          title="Your bag is empty"
          text="Find something useful to bring home."
          action="Continue shopping"
        />
      </main>
    )
  }

  return (
    <main className="cart">
      <div>
        <p className="eyebrow">YOUR BAG</p>
        <h1>Shopping cart</h1>

        {cart.map(item => (
          <div className="cart-item" key={item.id}>
            <img src={item.image} alt="" />

            <div>
              <h3>{item.name}</h3>
              <p>{money(item.price)}</p>

              <div className="quantity">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            <strong>{money(item.price * item.quantity)}</strong>

            <button
              className="remove"
              onClick={() => updateQuantity(item.id, 0)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <aside className="summary">
        <h2>Order summary</h2>

        <p>
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </p>

        <p>
          <span>Shipping</span>
          <b>Free</b>
        </p>

        <hr />

        <h3>
          <span>Total</span>
          <b>{money(subtotal)}</b>
        </h3>

        <button
          className="primary"
          onClick={() => go('/checkout')}
        >
          Checkout
        </button>
      </aside>
    </main>
  )
}

function Checkout() {
  const { cart, user, placeOrder } = useStore()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    card: ''
  })

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  if (!cart.length) {
    return (
      <main>
        <Empty
          title="Nothing to check out"
          text="Your bag is currently empty."
          action="Shop now"
        />
      </main>
    )
  }

  const updateForm = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const submit = e => {
    e.preventDefault()

    const order = placeOrder(form)
    go(`/confirmation/${order.id}`)
  }

  return (
    <main className="checkout">
      <form onSubmit={submit}>
        <p className="eyebrow">SECURE CHECKOUT</p>
        <h1>Delivery details</h1>

        {[
          ['name', 'Full name'],
          ['email', 'Email address'],
          ['address', 'Street address'],
          ['city', 'City'],
          ['card', 'Card number']
        ].map(([name, label]) => (
          <label key={name}>
            {label}

            <input
              required
              name={name}
              value={form[name]}
              onChange={updateForm}
              placeholder={
                name === 'card'
                  ? '4242 4242 4242 4242'
                  : ''
              }
            />
          </label>
        ))}

        <button className="primary">
          Place order · {money(total)}
        </button>
      </form>

      <aside className="summary">
        <h2>Your order</h2>

        {cart.map(item => (
          <p key={item.id}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <b>{money(item.price * item.quantity)}</b>
          </p>
        ))}

        <hr />

        <h3>
          <span>Total</span>
          <b>{money(total)}</b>
        </h3>
      </aside>
    </main>
  )
}

function Auth({ signup = false }) {
  const { setUser } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const submit = e => {
    e.preventDefault()

    setUser({
      name: name || email.split('@')[0],
      email,
      isAdmin: email.toLowerCase().includes('admin')
    })

    go('/')
  }

  return (
    <main className="auth">
      <form onSubmit={submit}>
        <p className="eyebrow">NORTHSTAR ACCOUNT</p>

        <h1>
          {signup ? 'Create your account' : 'Welcome back'}
        </h1>

        {signup && (
          <label>
            Full name
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
        )}

        <label>
          Email address
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input required type="password" minLength="4" />
        </label>

        <button className="primary">
          {signup ? 'Create account' : 'Sign in'}
        </button>

        <p>
          {signup ? 'Already a member?' : 'New to Northstar?'}{' '}
          <a href={signup ? '#/login' : '#/signup'}>
            {signup ? 'Sign in' : 'Create an account'}
          </a>
        </p>

        <small>
          Use an email containing “admin” to explore the admin area.
        </small>
      </form>
    </main>
  )
}

function Profile() {
  const { user, setUser, orders } = useStore()

  if (!user) return <Auth />

  return (
    <main className="profile">
      <p className="eyebrow">MY ACCOUNT</p>
      <h1>Hello, {user.name}</h1>

      <div className="profile-card">
        <h2>Account details</h2>
        <p>{user.email}</p>

        <button
          onClick={() => {
            setUser(null)
            go('/')
          }}
        >
          Sign out
        </button>
      </div>

      <h2>Recent orders</h2>

      {orders.length ? (
        orders.slice(0, 2).map(order => (
          <OrderRow key={order.id} order={order} />
        ))
      ) : (
        <p>You haven’t placed an order yet.</p>
      )}
    </main>
  )
}

function OrderRow({ order }) {
  return (
    <a className="order-row" href={`#/order/${order.id}`}>
      <div>
        <b>{order.id}</b>
        <p>
          {order.date} · {order.items.length} item(s)
        </p>
      </div>

      <span>{order.status}</span>
      <strong>{money(order.total)}</strong>
    </a>
  )
}

function Orders() {
  const { orders, user } = useStore()

  if (!user) {
    go('/login')
    return null
  }

  return (
    <main className="orders">
      <p className="eyebrow">YOUR PURCHASES</p>
      <h1>Order history</h1>

      {orders.length ? (
        orders.map(order => (
          <OrderRow key={order.id} order={order} />
        ))
      ) : (
        <Empty
          title="No orders yet"
          text="Once you check out, your orders will appear here."
          action="Start shopping"
        />
      )}
    </main>
  )
}

function OrderDetails({ id, confirmation = false }) {
  const { orders } = useStore()
  const order = orders.find(item => item.id === id)

  if (!order) {
    return (
      <main>
        <Empty
          title="Order not found"
          text="We could not find this order."
        />
      </main>
    )
  }

  return (
    <main className="order-details">
      {confirmation && (
        <div className="success">
          ✓
          <h1>Thanks for your order.</h1>
          <p>
            We’ll send a confirmation to {order.details.email}.
          </p>
        </div>
      )}

      <p className="eyebrow">ORDER {order.id}</p>
      <h2>{order.status}</h2>
      <p>Placed {order.date}</p>

      <div className="order-items">
        {order.items.map(item => (
          <div key={item.id}>
            <img src={item.image} alt="" />
            <span>
              {item.name} × {item.quantity}
            </span>
            <b>{money(item.price * item.quantity)}</b>
          </div>
        ))}
      </div>

      <h2>Total: {money(order.total)}</h2>
      <a href="#/orders">View all orders →</a>
    </main>
  )
}

function Wishlist() {
  const { products, wishlist } = useStore()
  const saved = products.filter(product =>
    wishlist.includes(product.id)
  )

  return (
    <main className="shop">
      <p className="eyebrow">SAVED FOR LATER</p>
      <h1>Wishlist</h1>

      {saved.length ? (
        <div className="product-grid">
          {saved.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Your wishlist is empty"
          text="Save the things you love to find them again."
          action="Explore shop"
        />
      )}
    </main>
  )
}

const blankProduct = {
  name: '',
  price: '',
  description: '',
  category: 'Apparel',
  image: '',
  stock: ''
}

function Admin() {
  const {
    products,
    orders,
    saveProduct,
    deleteProduct
  } = useStore()

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankProduct)

  const edit = product => {
    setEditing(product.id)
    setForm(product)
  }

  const updateForm = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const submit = e => {
    e.preventDefault()

    saveProduct({
      ...form,
      id: editing,
      price: Number(form.price),
      stock: Number(form.stock),
      rating: form.rating || 4.5,
      reviews: form.reviews || 0
    })

    setForm(blankProduct)
    setEditing(null)
  }

  return (
    <main className="admin">
      <p className="eyebrow">ADMIN AREA</p>
      <h1>Store dashboard</h1>

      <div className="stats">
        <div>
          <b>{products.length}</b> products
        </div>

        <div>
          <b>{orders.length}</b> orders
        </div>

        <div>
          <b>
            {money(
              orders.reduce(
                (sum, order) => sum + order.total,
                0
              )
            )}
          </b>{' '}
          sales
        </div>
      </div>

      <section>
        <h2>{editing ? 'Edit product' : 'Add a product'}</h2>

        <form className="product-form" onSubmit={submit}>
          {[
            ['name', 'Product name'],
            ['price', 'Price'],
            ['image', 'Image URL'],
            ['stock', 'Stock']
          ].map(([name, label]) => (
            <label key={name}>
              {label}

              <input
                name={name}
                required={name !== 'image'}
                type={
                  name === 'price' || name === 'stock'
                    ? 'number'
                    : 'text'
                }
                value={form[name]}
                onChange={updateForm}
              />
            </label>
          ))}

          <label>
            Category

            <select
              name="category"
              value={form.category}
              onChange={updateForm}
            >
              {categories.slice(1).map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="wide">
            Description

            <textarea
              name="description"
              required
              value={form.description}
              onChange={updateForm}
            />
          </label>

          <button className="primary">
            {editing ? 'Save changes' : 'Add product'}
          </button>

          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setForm(blankProduct)
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Products</h2>

        <div className="admin-list">
          {products.map(product => (
            <div key={product.id}>
              <img src={product.image} alt="" />

              <span>
                <b>{product.name}</b>
                <small>
                  {product.category} · {money(product.price)}
                </small>
              </span>

              <button onClick={() => edit(product)}>
                Edit
              </button>

              <button onClick={() => deleteProduct(product.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Orders</h2>

        {orders.length ? (
          orders.map(order => (
            <OrderRow key={order.id} order={order} />
          ))
        ) : (
          <p>No orders received yet.</p>
        )}
      </section>
    </main>
  )
}

function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{text}</p>

      {action && (
        <button
          className="primary"
          onClick={() => go('/shop')}
        >
          {action}
        </button>
      )}
    </div>
  )
}

function Footer() {
  return (
    <footer>
      <b>NORTHSTAR</b>
      <span>Everyday goods, thoughtfully selected.</span>
      <span>© 2026 Northstar</span>
    </footer>
  )
}

function App() {
  const [path, setPath] = useState(
    window.location.hash.slice(1) || '/'
  )

  useEffect(() => {
    const update = () => {
      setPath(window.location.hash.slice(1) || '/')
    }

    window.addEventListener('hashchange', update)

    return () => {
      window.removeEventListener('hashchange', update)
    }
  }, [])

  const parts = path.split('/')
  let page

  if (path === '/') page = <Home />
  else if (path === '/shop') page = <Shop />
  else if (path.startsWith('/category/')) {
    page = (
      <Shop
        initialCategory={decodeURIComponent(parts[2])}
      />
    )
  } else if (path.startsWith('/product/')) {
    page = <ProductPage id={parts[2]} />
  } else if (path === '/cart') page = <Cart />
  else if (path === '/checkout') page = <Checkout />
  else if (path === '/login') page = <Auth />
  else if (path === '/signup') page = <Auth signup />
  else if (path === '/profile') page = <Profile />
  else if (path === '/wishlist') page = <Wishlist />
  else if (path === '/orders') page = <Orders />
  else if (path.startsWith('/confirmation/')) {
    page = (
      <OrderDetails
        id={parts[2]}
        confirmation
      />
    )
  } else if (path.startsWith('/order/')) {
    page = <OrderDetails id={parts[2]} />
  } else if (path === '/admin') {
    page = <Admin />
  } else {
    page = <Home />
  }

  return (
    <>
      <Header />
      {page}
      <Footer />
    </>
  )
}

export default App