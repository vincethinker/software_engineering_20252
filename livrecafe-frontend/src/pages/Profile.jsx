import { useEffect, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import { useAuth } from "../context/AuthContext";

const emptyProfile = {
  fullName: "",
  phone: "",
  gender: "",
  identityNumber: "",
  birthday: "",
  email: "",
  city: "",
  district: "",
  ward: "",
  address: ""
};

function normalizeDate(dateValue) {
  if (!dateValue) return "";

  // If MongoDB returns ISO date string, keep only yyyy-mm-dd for input type="date".
  return String(dateValue).slice(0, 10);
}

function mapUserToForm(userData) {
  return {
    fullName: userData?.fullName || "",
    phone: userData?.phone || "",
    gender: userData?.gender || "",
    identityNumber: userData?.identityNumber || "",
    birthday: normalizeDate(userData?.birthday),
    email: userData?.email || "",
    city: userData?.city || "",
    district: userData?.district || "",
    ward: userData?.ward || "",
    address: userData?.address || ""
  };
}

function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState(() => {
    const savedUser = localStorage.getItem("livrecafe_user");

    if (savedUser) {
      return mapUserToForm(JSON.parse(savedUser));
    }

    return emptyProfile;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(mapUserToForm(user));
    }
  }, [user]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("livrecafe_token");

      if (!token) return;

      try {
        setIsLoading(true);

        const response = await fetch("http://localhost:3000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("Không thể tải thông tin tài khoản:", data);
          return;
        }

        const normalizedUser = {
          ...data,
          id: data._id || data.id
        };

        setFormData(mapUserToForm(normalizedUser));
        localStorage.setItem("livrecafe_user", JSON.stringify(normalizedUser));

        if (updateUser) {
          updateUser(normalizedUser);
        }
      } catch (error) {
        console.error("Lỗi tải thông tin tài khoản:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      alert("Vui lòng nhập họ tên");
      return;
    }

    if (!formData.identityNumber.trim()) {
      alert("Vui lòng nhập số CMND/CCCD");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

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

      const normalizedUser = {
        ...data.user,
        id: data.user._id || data.user.id
      };

      localStorage.setItem("livrecafe_user", JSON.stringify(normalizedUser));

      if (updateUser) {
        updateUser(normalizedUser);
      }

      setFormData(mapUserToForm(normalizedUser));

      alert("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
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

            {isLoading && <p className="profile-loading">Đang tải thông tin...</p>}

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
