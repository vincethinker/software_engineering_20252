import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    gender: "",
    identityNumber: "",
    birthday: "",
    email: user?.email || "",
    city: "",
    district: "",
    ward: "",
    address: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const token = localStorage.getItem("livrecafe_token");

    const response = await fetch("http://localhost:3000/api/auth/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Cập nhật thất bại");
      return;
    }

    updateUser(data.user);

    alert("Cập nhật thông tin thành công");
  } catch (error) {
    alert("Không thể kết nối server");
  }
  };

  return (
    <div className="page">
      <Header />

      <main className="account-main">
        <div className="account-breadcrumb">
          <span>Trang chủ</span> / <strong>Tài khoản</strong>
        </div>

        <div className="account-layout">
          <AccountSidebar />

          <section className="account-content-card profile-card">
            <h1>Thông tin cá nhân</h1>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-field">
                <label>Họ & tên</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="profile-field">
                <label>Số CMND/CCCD</label>
                <input
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Ngày sinh</label>
                <input
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Tỉnh/Thành phố</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Quận/Huyện</label>
                <input
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Phường/Xã</label>
                <input
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Địa chỉ</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-actions">
                <button type="submit">Lưu thay đổi</button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;