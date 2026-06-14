import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";

function MyOrders() {
  const orders = [];

  const tabs = [
    "Chờ thanh toán",
    "Đơn hàng mới",
    "Đang xử lý",
    "Đang giao",
    "Hoàn thành",
    "Hủy"
  ];

  return (
    <div className="page">
      <Header />

      <main className="account-main">
        <div className="account-breadcrumb">
          <span>Trang chủ</span> / <strong>Tài khoản</strong>
        </div>

        <div className="account-layout">
          <AccountSidebar />

          <section className="account-content-card orders-card">
            <div className="orders-header">
              <h1>Lịch sử đơn hàng</h1>

              <input
                className="order-search"
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng"
              />
            </div>

            <div className="order-tabs">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={index === 0 ? "active" : ""}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            {orders.length === 0 ? (
              <div className="empty-state order-empty">
                Không có đơn hàng nào
              </div>
            ) : (
              <div className="order-list">
                {orders.map((order) => (
                  <div key={order.id}>{order.id}</div>
                ))}
              </div>
            )}

            <div className="pagination-demo">
              <button>‹</button>
              <span>1</span>
              <button>›</button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyOrders;