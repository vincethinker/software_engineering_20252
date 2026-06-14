import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

function PaymentSuccess() {
  return (
    <div className="page">
      <Header />

      <main className="payment-success-main">
        <section className="payment-success-card">
          <h1>Thanh toán thành công</h1>

          <p>
            Cảm ơn bạn đã đặt hàng tại Livrè Cafe.
          </p>

          <Link to="/">
            Nhấn vào đây để quay lại trang chủ
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PaymentSuccess;