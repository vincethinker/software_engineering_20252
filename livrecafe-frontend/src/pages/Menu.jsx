import { useEffect, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

function Menu() {
  const [products, setProducts] = useState([]);
  const [type, setType] = useState("drink");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let url = `http://localhost:3000/api/products?type=${type}`;

    if (category !== "all") {
      url += `&category=${encodeURIComponent(category)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Lỗi tải thực đơn:", error));
  }, [type, category]);

  return (
    <div className="page">
      <Header />

      <main className="main-content">
        <div className="breadcrumb">
          <span>Trang chủ</span> / <strong>Thực đơn</strong>
        </div>

        <div className="menu-layout">
          <aside className="sidebar">
            <p onClick={() => { setType("drink"); setCategory("all"); }}>
              Tất cả đồ uống
            </p>

            <p onClick={() => { setType("drink"); setCategory("Coffee"); }}>
              Coffee
            </p>

            <p onClick={() => { setType("drink"); setCategory("Tea"); }}>
              Tea
            </p>

            <p onClick={() => { setType("drink"); setCategory("Smoothie"); }}>
              Smoothie
            </p>

            <p onClick={() => { setType("drink"); setCategory("Juice"); }}>
              Juice
            </p>

            <p onClick={() => { setType("snack"); setCategory("all"); }}>
              Snack / Bánh
            </p>
          </aside>

          <section className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Menu;