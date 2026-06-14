import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

function Booking() {
  const navigate = useNavigate();

  const [selectedMenu, setSelectedMenu] = useState([]);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    eventName: "",
    eventType: "",
    eventDate: "",
    eventTime: "",
    participantCount: "",
    duration: "",
    note: ""
  });

  useEffect(() => {
    const savedMenu = localStorage.getItem("livrecafe_booking_menu");

    if (savedMenu) {
      setSelectedMenu(JSON.parse(savedMenu));
    }
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const menuTotal = selectedMenu.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const participantCount = Number(formData.participantCount) || 0;

  const spaceFee = participantCount > 0 ? participantCount * 20000 : 0;

  const estimatedTotal = spaceFee + menuTotal;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const goToMenuSelect = () => {
    navigate("/dat-cho/chon-thuc-don");
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) return "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại";
    if (!formData.email.trim()) return "Vui lòng nhập email";
    if (!formData.eventName.trim()) return "Vui lòng nhập tên sự kiện";
    if (!formData.eventType) return "Vui lòng chọn loại sự kiện";
    if (!formData.eventDate) return "Vui lòng chọn ngày tổ chức";
    if (!formData.eventTime) return "Vui lòng chọn giờ tổ chức";
    if (!formData.participantCount) return "Vui lòng nhập số người tham gia";
    if (Number(formData.participantCount) <= 0) {
      return "Số người tham gia phải lớn hơn 0";
    }
    if (!formData.duration) return "Vui lòng chọn thời lượng sử dụng";
    if (selectedMenu.length === 0) {
      return "Vui lòng chọn ít nhất một món đồ ăn hoặc đồ uống";
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    const bookingData = {
      ...formData,
      selectedMenu,
      spaceFee,
      menuTotal,
      estimatedTotal,
      status: "pending"
    };

    console.log("Booking data:", bookingData);

    alert(
      "Đặt chỗ thành công. Cửa hàng sẽ liên hệ lại để trao đổi và xác nhận đặt cọc."
    );

    localStorage.removeItem("livrecafe_booking_menu");

    navigate("/");
  };

  return (
    <div className="page">
      <Header />

      <main className="booking-main">
        <div className="booking-breadcrumb">
          <span>Trang chủ</span> / <strong>Đặt chỗ</strong>
        </div>

        <div className="booking-layout">

          <section className="booking-form-card">
            <h1>Đăng ký đặt chỗ / tổ chức sự kiện</h1>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="booking-field">
                <label>Họ và tên khách hàng</label>
                <input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="booking-field">
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="booking-field">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                />
              </div>

              <div className="booking-field">
                <label>Tên sự kiện</label>
                <input
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Workshop đọc sách"
                />
              </div>

              <div className="booking-field">
                <label>Loại sự kiện</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                >
                  <option value="">Chọn loại sự kiện</option>
                  <option value="talkshow">Talking show</option>
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Họp nhóm</option>
                  <option value="study">Học tập / làm việc nhóm</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="booking-field">
                <label>Số người tham gia</label>
                <input
                  name="participantCount"
                  type="number"
                  min="1"
                  value={formData.participantCount}
                  onChange={handleChange}
                  placeholder="Nhập số người"
                />
              </div>

              <div className="booking-field">
                <label>Ngày tổ chức</label>
                <input
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange}
                />
              </div>

              <div className="booking-field">
                <label>Giờ bắt đầu</label>
                <input
                  name="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={handleChange}
                />
              </div>

              <div className="booking-field">
                <label>Thời lượng sử dụng</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                >
                  <option value="">Chọn thời lượng</option>
                  <option value="1">1 giờ</option>
                  <option value="2">2 giờ</option>
                  <option value="3">3 giờ</option>
                  <option value="4">4 giờ</option>
                  <option value="full_day">Cả buổi</option>
                </select>
              </div>

              <div className="booking-field booking-menu-select-field">
                <label>Chọn đồ ăn - uống</label>
                <button type="button" onClick={goToMenuSelect}>
                  Chọn thực đơn
                </button>
              </div>

              <div className="booking-field booking-note-field">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm nếu có"
                />
              </div>

              <div className="booking-selected-menu">
                <h2>Thực đơn đã chọn</h2>

                {selectedMenu.length === 0 ? (
                  <p className="booking-empty-menu">
                    Chưa chọn món ăn hoặc đồ uống.
                  </p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Tên món</th>
                        <th>Loại</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedMenu.map((item) => (
                        <tr key={item._id}>
                          <td>{item.name}</td>
                          <td>{item.type === "drink" ? "Đồ uống" : "Đồ ăn"}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="booking-estimate-box">
                <div>
                  <span>Phí không gian tạm tính</span>
                  <strong>{formatPrice(spaceFee)}</strong>
                </div>

                <div>
                  <span>Tổng tiền đồ ăn - uống</span>
                  <strong>{formatPrice(menuTotal)}</strong>
                </div>

                <div className="booking-estimate-total">
                  <span>Tổng báo giá tạm tính</span>
                  <strong>{formatPrice(estimatedTotal)}</strong>
                </div>
              </div>

              <div className="booking-submit-row">
                <button type="submit">Đặt chỗ</button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Booking;