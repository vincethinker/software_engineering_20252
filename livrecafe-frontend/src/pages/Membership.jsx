import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import { useAuth } from "../context/AuthContext";
import logoLarge from "../assets/icons/logo-large.png";

function Membership() {
  const { user } = useAuth();

  const points = user?.points || 0;

  const levels = [
    { name: "Đồng", min: 0 },
    { name: "Bạc", min: 100 },
    { name: "Vàng", min: 300 },
    { name: "Kim cương", min: 600 }
  ];

  const maxPoints = 600;

  let currentLevel = "Đồng";

  if (points >= 600) currentLevel = "Kim cương";
  else if (points >= 300) currentLevel = "Vàng";
  else if (points >= 100) currentLevel = "Bạc";

  const progressPercent = Math.min((points / maxPoints) * 100, 100);

  return (
    <div className="page">
      <Header />

      <main className="account-main">
        <div className="account-breadcrumb">
          <span>Trang chủ</span> / <strong>Tài khoản</strong>
        </div>

        <div className="account-layout">
          <AccountSidebar />

          <section className="membership-content">
            <div className="membership-banner">
              <img
                src={logoLarge}
                alt="Livrè Cafe"
                className="membership-logo-image"
              />
            </div>

            <div className="membership-card">
              <h2>
                Hạng thành viên: <span>{currentLevel}</span>
              </h2>

              <div className="membership-progress-wrapper">
                <div className="level-row">
                  {levels.map((level) => (
                    <div
                      key={level.name}
                      className="level-label"
                      style={{ left: `${(level.min / maxPoints) * 100}%` }}
                    >
                      {level.name}
                    </div>
                  ))}
                </div>

                <div className="level-progress">
                  <div
                    className="level-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />

                  {levels.map((level) => (
                    <div
                      key={level.name}
                      className={`progress-marker ${
                        points >= level.min ? "active" : ""
                      }`}
                      style={{ left: `${(level.min / maxPoints) * 100}%` }}
                      title={`${level.name} - ${level.min} điểm`}
                    />
                  ))}
                </div>

                <div className="level-points-row">
                  {levels.map((level) => (
                    <div
                      key={level.name}
                      className="level-point-value"
                      style={{ left: `${(level.min / maxPoints) * 100}%` }}
                    >
                      {level.min}
                    </div>
                  ))}
                </div>
              </div>

              <p>
                Bạn đang có <strong>{points}</strong> điểm thành viên.
              </p>

              <p>
                Tích thêm điểm khi mua sách, đồ uống hoặc sử dụng dịch vụ tại
                Livrè Cafe.
              </p>
            </div>

            <div className="membership-grid">
              <div className="account-content-card">
                <h2>Ưu đãi thành viên</h2>
                <p>Đồng: tích điểm cơ bản.</p>
                <p>Bạc: giảm 5% cho đơn hàng.</p>
                <p>Vàng: giảm 10% và nhận ưu đãi sinh nhật.</p>
                <p>Kim cương: giảm 15% và ưu tiên đặt không gian.</p>
              </div>

              <div className="account-content-card">
                <h2>Điểm đổi quà</h2>
                <p>
                  Bạn có <strong>{points}</strong> điểm.
                </p>
                <p>100 điểm: đổi 1 đồ uống size nhỏ.</p>
                <p>300 điểm: đổi 1 phần bánh.</p>
                <p>600 điểm: đổi combo sách + cà phê.</p>
              </div>

              <div className="account-content-card">
                <h2>Lịch sử giao dịch</h2>
                <p>Chưa có giao dịch tích điểm.</p>
              </div>

              <div className="account-content-card">
                <h2>Lịch sử hạng thành viên</h2>
                <div className="rank-history">
                  <div>
                    <span>Đồng</span>
                    <strong>0 điểm</strong>
                  </div>
                  <div>
                    <span>Bạc</span>
                    <strong>100 điểm</strong>
                  </div>
                  <div>
                    <span>Vàng</span>
                    <strong>300 điểm</strong>
                  </div>
                  <div>
                    <span>Kim cương</span>
                    <strong>600 điểm</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Membership;