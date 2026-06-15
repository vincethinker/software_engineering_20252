import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import logoLarge from "../assets/icons/logo-large.png";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên");
      return;
    }

    if (!identityNumber.trim()) {
      setErrorMessage("Vui lòng nhập số CCCD");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          identityNumber,
          phone,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Đăng ký thất bại");
        return;
      }

      if (data.user) {
        localStorage.setItem("livrecafe_user", JSON.stringify(data.user));
      }

      if (data.token) {
        localStorage.setItem("livrecafe_token", data.token);
      }

      alert("Đăng ký thành công. Vui lòng kiểm tra thông tin cá nhân.");
      navigate("/thong-tin-ca-nhan", { replace: true });
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
          placeholder="Nhập họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Nhập số CCCD"
          value={identityNumber}
          onChange={(e) => setIdentityNumber(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <button type="submit">Đăng ký</button>

        <div className="auth-links">
          <Link to="/dang-nhap">Đã có tài khoản?</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;