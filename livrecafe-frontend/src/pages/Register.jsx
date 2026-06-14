import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import logoLarge from "../assets/icons/logo-large.png";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
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

      alert("Đăng ký thành công. Vui lòng đăng nhập.");
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
          type="text"
          placeholder="Nhập họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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