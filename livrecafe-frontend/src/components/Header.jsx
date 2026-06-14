import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import logo from "../assets/icons/logo.png";
import userIcon from "../assets/icons/user.png";
import cartIcon from "../assets/icons/cart.png";

function Header() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { totalTypes } = useCart();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate("/dang-nhap");
      return;
    }

    setIsUserMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <img src={logo} alt="Livrè Cafe" />
      </Link>

      <nav className="nav">
        <Link to="/">Trang chủ</Link>
        <Link to="/thuc-don">Thực đơn</Link>
        <Link to="/sach">Sách</Link>
        <Link to="/dat-cho">Đặt chỗ</Link>
      </nav>

      <div className="header-actions">
        <Link to="/thanh-toan" className="header-icon cart-header-icon">
          <img src={cartIcon} alt="Giỏ hàng" />

          {totalTypes > 0 && (
            <span className="cart-badge">{totalTypes}</span>
          )}
        </Link>

        <div className="user-menu-wrapper">
          <button className="user-button" onClick={handleUserClick}>
            <img src={userIcon} alt="Tài khoản" />
          </button>

          {isLoggedIn && isUserMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <strong>{user?.fullName}</strong>
                <span>{user?.phone}</span>
              </div>

              <Link
                to="/thong-tin-ca-nhan"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Thông tin cá nhân
              </Link>

              <Link
                to="/khach-hang-thanh-vien"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Khách hàng thành viên
              </Link>

              <Link
                to="/uu-dai-cua-toi"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Ưu đãi của tôi
              </Link>

              <Link to="/don-hang" onClick={() => setIsUserMenuOpen(false)}>
                Đơn hàng
              </Link>

              <button className="logout-button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;