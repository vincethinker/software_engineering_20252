import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import logoLarge from "../assets/icons/logo-large.png";

function ForgotPassword() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Làm lại mật khẩu thất bại");
        return;
      }

      alert("Đổi mật khẩu thành công. Vui lòng đăng nhập.");
      navigate("/dang-nhap");
    } catch (error) {
      setErrorMessage("Không thể kết nối server");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <img className="auth-logo" src={logoLarge} alt="Livrè Cafe" />

        <input
          type="text"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <button type="submit">Xác nhận</button>

        <div className="auth-links">
          <Link to="/dang-nhap">Quay lại đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;