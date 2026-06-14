import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalQuantity
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("bank");

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const handlePayment = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }

    clearCart();
    navigate("/thanh-toan-thanh-cong");
  };

  return (
    <div className="page">
      <Header />

      <main className="checkout-main">
        <section className="checkout-card">
          <h1>Giỏ hàng của bạn ({totalQuantity} món)</h1>

          {cartItems.length === 0 ? (
            <div className="checkout-empty">
              Giỏ hàng của bạn đang trống.
            </div>
          ) : (
            <>
              <div className="checkout-items">
                {cartItems.map((item) => {
                  const imageSource = item.imageUrl
                    ? `http://localhost:3000${item.imageUrl}`
                    : "";

                  return (
                    <div className="checkout-item" key={item._id}>
                      <div className="checkout-item-image">
                        {imageSource ? (
                          <img src={imageSource} alt={item.name} />
                        ) : (
                          <span>Không có ảnh</span>
                        )}
                      </div>

                      <div className="checkout-item-info">
                        <h2>{item.name}</h2>

                        {item.type === "book" && (
                          <p>{item.author}</p>
                        )}

                        <strong>{formatPrice(item.price)}</strong>
                      </div>

                      <div className="checkout-quantity">
                        <button onClick={() => decreaseQuantity(item._id)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item._id)}>
                          +
                        </button>
                      </div>

                      <button
                        className="checkout-remove"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-payment-info">
                <h2>Thông tin thanh toán</h2>

                <div className="checkout-row">
                  <span>Tổng tiền tạm tính</span>
                  <strong>{formatPrice(totalAmount)}</strong>
                </div>

                <div className="checkout-row">
                  <span>Phí vận chuyển</span>
                  <strong>{formatPrice(0)}</strong>
                </div>

                <div className="checkout-row">
                  <span>Mã giảm giá</span>
                  <strong>Chưa áp dụng</strong>
                </div>

                <div className="checkout-row checkout-total">
                  <span>Tổng tiền</span>
                  <strong>{formatPrice(totalAmount)}</strong>
                </div>
              </div>

              <div className="payment-method-box">
                <h2>Phương thức thanh toán</h2>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Thẻ ngân hàng / Thẻ tín dụng</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Thanh toán bằng tiền mặt</span>
                </label>
              </div>

              <button className="checkout-submit-btn" onClick={handlePayment}>
                Tiến hành thanh toán
              </button>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;