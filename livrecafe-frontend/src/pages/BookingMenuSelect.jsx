import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

function BookingMenuSelect() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
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

  useEffect(() => {
    const savedMenu = localStorage.getItem("livrecafe_booking_menu");

    if (savedMenu) {
      const parsedMenu = JSON.parse(savedMenu);
      const savedQuantities = {};

      parsedMenu.forEach((item) => {
        savedQuantities[item._id] = item.quantity;
      });

      setQuantities(savedQuantities);
    }
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const increaseQuantity = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const decreaseQuantity = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0)
    }));
  };

  const handleConfirmMenu = () => {
    const selectedItems = products
      .filter((product) => (quantities[product._id] || 0) > 0)
      .map((product) => ({
        ...product,
        quantity: quantities[product._id]
      }));

    const oldSavedMenu = JSON.parse(
      localStorage.getItem("livrecafe_booking_menu") || "[]"
    );

    const selectedMap = new Map();

    oldSavedMenu.forEach((item) => {
      selectedMap.set(item._id, item);
    });

    selectedItems.forEach((item) => {
      selectedMap.set(item._id, item);
    });

    const finalMenu = Array.from(selectedMap.values()).filter(
      (item) => item.quantity > 0
    );

    localStorage.setItem("livrecafe_booking_menu", JSON.stringify(finalMenu));

    navigate("/dat-cho");
  };

  return (
    <div className="page">
      <Header />

      <main className="booking-menu-main">
        <div className="booking-breadcrumb">
          <span>Trang chủ</span> / <strong>Chọn đồ ăn - uống</strong>
        </div>

        <div className="booking-menu-layout">
          <aside className="booking-menu-sidebar">
            <p
              onClick={() => {
                setType("drink");
                setCategory("all");
              }}
            >
              Tất cả đồ uống
            </p>

            <p
              onClick={() => {
                setType("drink");
                setCategory("Coffee");
              }}
            >
              Coffee
            </p>

            <p
              onClick={() => {
                setType("drink");
                setCategory("Tea");
              }}
            >
              Tea
            </p>

            <p
              onClick={() => {
                setType("drink");
                setCategory("Smoothie");
              }}
            >
              Smoothie
            </p>

            <p
              onClick={() => {
                setType("drink");
                setCategory("Juice");
              }}
            >
              Juice
            </p>

            <p
              onClick={() => {
                setType("snack");
                setCategory("all");
              }}
            >
              Snack / Bánh
            </p>
          </aside>

          <section className="booking-menu-content">
            <div className="booking-menu-grid">
              {products.map((product) => {
                const imageSource = product.imageUrl
                  ? `http://localhost:3000${product.imageUrl}`
                  : "";

                const quantity = quantities[product._id] || 0;

                return (
                  <div className="booking-menu-card" key={product._id}>
                    <div className="booking-menu-image">
                      {imageSource ? (
                        <img src={imageSource} alt={product.name} />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </div>

                    <div className="booking-menu-info">
                      <h3>{product.name}</h3>
                      <p>{formatPrice(product.price)}</p>

                      <div className="booking-menu-quantity">
                        <button onClick={() => decreaseQuantity(product._id)}>
                          -
                        </button>

                        <span>{quantity}</span>

                        <button onClick={() => increaseQuantity(product._id)}>
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="booking-confirm-menu-btn"
              onClick={handleConfirmMenu}
            >
              Xác nhận thực đơn
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default BookingMenuSelect;