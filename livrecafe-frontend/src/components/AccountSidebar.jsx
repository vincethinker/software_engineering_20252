import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AccountSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="account-sidebar">
      <NavLink to="/thong-tin-ca-nhan" className="account-menu-item">
        <span>Thông tin cá nhân</span>
        <span className="account-arrow">›</span>
      </NavLink>

      <NavLink to="/khach-hang-thanh-vien" className="account-menu-item">
        <span>Khách hàng thành viên</span>
        <span className="account-arrow">›</span>
      </NavLink>

      <NavLink to="/uu-dai-cua-toi" className="account-menu-item">
        <span>Ưu đãi của tôi</span>
        <span className="account-arrow">›</span>
      </NavLink>

      <NavLink to="/don-hang" className="account-menu-item">
        <span>Đơn hàng</span>
        <span className="account-arrow">›</span>
      </NavLink>

      <button className="account-menu-item account-logout" onClick={handleLogout}>
        <span>Đăng xuất</span>
        <span className="account-arrow">›</span>
      </button>
    </aside>
  );
}

export default AccountSidebar;