import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import logoLarge from "../assets/icons/logo-large.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại");
        return;
      }

      login(data.user, data.token);
      navigate("/");
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
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <button type="submit">Đăng nhập</button>

        <div className="auth-links">
          <Link to="/dang-ky">Đăng ký</Link>
          <Link to="/lam-lai-mat-khau">Quên mật khẩu?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;