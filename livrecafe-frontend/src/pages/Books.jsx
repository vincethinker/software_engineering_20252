import { useEffect, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products?type=book")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Lỗi tải sách:", error));
  }, []);

  return (
    <div className="page">
      <Header />

      <main className="main-content">
        <div className="breadcrumb">
          <span>Trang chủ</span> / <strong>Sách</strong>
        </div>

        <div className="menu-layout">
          <aside className="sidebar">
            <p>Tất cả</p>
            <p>Tiểu thuyết</p>
            <p>Kỹ năng sống</p>
            <p>Kinh tế</p>
            <p>Sách đọc tại quán</p>
          </aside>

          <section className="product-grid">
            {books.map((book) => (
              <ProductCard key={book._id} product={book} />
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Books;