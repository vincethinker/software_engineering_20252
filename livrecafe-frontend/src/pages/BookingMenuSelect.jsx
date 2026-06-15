import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

const BOOKING_MENU_KEY = "livrecafe_booking_menu";

function BookingMenuSelect() {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [type, setType] = useState("drink");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [drinkRes, snackRes] = await Promise.all([
          fetch("http://localhost:3000/api/products?type=drink"),
          fetch("http://localhost:3000/api/products?type=snack")
        ]);

        const drinks = await drinkRes.json();
        const snacks = await snackRes.json();

        setAllProducts([...drinks, ...snacks]);
      } catch (error) {
        console.error("Lỗi tải thực đơn:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const savedMenu = localStorage.getItem(BOOKING_MENU_KEY);

    if (savedMenu) {
      const parsedMenu = JSON.parse(savedMenu);
      const savedQuantities = {};

      parsedMenu.forEach((item) => {
        savedQuantities[item._id] = item.quantity;
      });

      setQuantities(savedQuantities);
    }
  }, []);

  const products = useMemo(() => {
    return allProducts.filter((product) => {
      if (product.type !== type) return false;

      if (category !== "all" && product.category !== category) {
        return false;
      }

      return true;
    });
  }, [allProducts, type, category]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + " đ";
  };

  const increaseQuantity = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const decreaseQuantity = (productId) => {
    setQuantities((prev) => {
      const currentQuantity = prev[productId] || 0;
      const nextQuantity = Math.max(currentQuantity - 1, 0);

      return {
        ...prev,
        [productId]: nextQuantity
      };
    });
  };

  const handleConfirmMenu = () => {
    const finalMenu = allProducts
      .filter((product) => (quantities[product._id] || 0) > 0)
      .map((product) => ({
        ...product,
        quantity: quantities[product._id]
      }));

    localStorage.setItem(BOOKING_MENU_KEY, JSON.stringify(finalMenu));

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
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(product._id)}
                        >
                          -
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(product._id)}
                        >
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
