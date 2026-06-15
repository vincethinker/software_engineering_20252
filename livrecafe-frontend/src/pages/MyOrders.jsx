import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const savedUser = localStorage.getItem("livrecafe_user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  const customerId = user?._id || user?.id || user?.customerId;

  const statusTabs = [
    { value: "all", label: "TẤT CẢ" },
    { value: "pending", label: "ĐƠN HÀNG MỚI" },
    { value: "confirmed", label: "ĐÃ XÁC NHẬN" },
    { value: "preparing", label: "ĐANG XỬ LÝ" },
    { value: "completed", label: "HOÀN THÀNH" },
  ];

  const statusVN = {
    pending: "Đơn hàng mới",
    confirmed: "Đã xác nhận",
    preparing: "Đang xử lý",
    completed: "Hoàn thành",
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const fetchOrders = async () => {
    if (!customerId) {
      setLoading(false);
      setOrders([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/orders/customer/${customerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Lỗi lấy lịch sử đơn hàng:", data);
        setOrders([]);
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error("Không thể tải lịch sử đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [customerId]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        activeStatus === "all" || order.status === activeStatus;

      const keyword = searchText.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        order._id.toLowerCase().includes(keyword) ||
        order._id.slice(-8).toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [orders, activeStatus, searchText]);

  return (
    <div className="page">
      <Header />

      <main className="account-main">
        <div className="account-breadcrumb">
          <span>Trang chủ</span> / <strong>Tài khoản</strong>
        </div>

        <div className="account-layout">
          <AccountSidebar />

          <section className="account-content-card">
            <div className="orders-header-row">
              <h1>Lịch sử đơn hàng</h1>

              <input
                className="orders-search-input"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn hàng"
              />
            </div>

            <div className="orders-tabs">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={activeStatus === tab.value ? "active" : ""}
                  onClick={() => setActiveStatus(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {!user ? (
              <div className="orders-empty">
                Vui lòng đăng nhập để xem lịch sử đơn hàng
              </div>
            ) : loading ? (
              <div className="orders-empty">Đang tải đơn hàng...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-empty">Không có đơn hàng nào</div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <div className="order-history-card" key={order._id}>
                    <div className="order-history-top">
                      <div>
                        <strong>Mã đơn: {order._id.slice(-8)}</strong>
                        <p>
                          Ngày đặt:{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </p>
                      </div>

                      <span className={`order-status-badge ${order.status}`}>
                        {statusVN[order.status] || order.status}
                      </span>
                    </div>

                    <div className="order-history-items">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div
                            className="order-history-item"
                            key={`${order._id}-${index}`}
                          >
                            <span>
                              {item.name} x {item.quantity}
                            </span>

                            <strong>
                              {formatPrice(item.price * item.quantity)}
                            </strong>
                          </div>
                        ))
                      ) : (
                        <p>Không có sản phẩm trong đơn.</p>
                      )}
                    </div>

                    <div className="order-history-total">
                      <span>Tổng tiền</span>
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyOrders;