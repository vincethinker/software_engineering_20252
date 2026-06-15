import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import { useAuth } from "../context/AuthContext";
import logoLarge from "../assets/icons/logo-large.png";

function Membership() {
  const { user, updateUser } = useAuth();

  const [points, setPoints] = useState(user?.points || 0);
  const [membershipLevel, setMembershipLevel] = useState(
    user?.membershipLevel || "Đồng"
  );
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultLevels = [
    {
      name: "Đồng",
      min: 0,
      benefitDescription: "Tích điểm cơ bản."
    },
    {
      name: "Bạc",
      min: 100,
      benefitDescription: "Giảm 5% cho đơn hàng."
    },
    {
      name: "Vàng",
      min: 300,
      benefitDescription: "Giảm 10% và nhận ưu đãi sinh nhật."
    },
    {
      name: "Kim cương",
      min: 600,
      benefitDescription: "Giảm 15% và ưu tiên đặt không gian."
    }
  ];

  useEffect(() => {
    const fetchMembershipInfo = async () => {
      try {
        const token = localStorage.getItem("livrecafe_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:3000/api/loyalty/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("Không thể lấy thông tin thành viên:", data);
          setLoading(false);
          return;
        }

        const newPoints = Number(data.points || 0);
        const newMembershipLevel = data.membershipLevel || "Đồng";

        setPoints(newPoints);
        setMembershipLevel(newMembershipLevel);
        setTiers(Array.isArray(data.tiers) ? data.tiers : []);

        const savedUser = localStorage.getItem("livrecafe_user");
        const currentUser = savedUser ? JSON.parse(savedUser) : user || {};

        const updatedUser = {
          ...currentUser,
          points: newPoints,
          membershipLevel: newMembershipLevel
        };

        localStorage.setItem("livrecafe_user", JSON.stringify(updatedUser));

        if (updateUser) {
          updateUser(updatedUser);
        }
      } catch (error) {
        console.error("Lỗi tải thông tin thành viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipInfo();
  }, []);

  const levels = useMemo(() => {
    if (!tiers || tiers.length === 0) {
      return defaultLevels;
    }

    return tiers
      .map((tier) => ({
        name: tier.tierName,
        min: Number(tier.requiredPoints || 0),
        benefitDescription: tier.benefitDescription || ""
      }))
      .sort((a, b) => a.min - b.min);
  }, [tiers]);

  const maxPoints = levels.length > 0 ? levels[levels.length - 1].min : 600;

  const currentLevel = useMemo(() => {
    if (membershipLevel) {
      return membershipLevel;
    }

    let level = "Đồng";

    levels.forEach((item) => {
      if (points >= item.min) {
        level = item.name;
      }
    });

    return level;
  }, [membershipLevel, levels, points]);

  const progressPercent =
    maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0;

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
                Hạng thành viên:{" "}
                <span>{loading ? "Đang tải..." : currentLevel}</span>
              </h2>

              <div className="membership-progress-wrapper">
                <div className="level-row">
                  {levels.map((level) => (
                    <div
                      key={level.name}
                      className="level-label"
                      style={{
                        left: `${
                          maxPoints > 0 ? (level.min / maxPoints) * 100 : 0
                        }%`
                      }}
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
                      style={{
                        left: `${
                          maxPoints > 0 ? (level.min / maxPoints) * 100 : 0
                        }%`
                      }}
                      title={`${level.name} - ${level.min} điểm`}
                    />
                  ))}
                </div>

                <div className="level-points-row">
                  {levels.map((level) => (
                    <div
                      key={level.name}
                      className="level-point-value"
                      style={{
                        left: `${
                          maxPoints > 0 ? (level.min / maxPoints) * 100 : 0
                        }%`
                      }}
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

                {levels.map((level) => (
                  <p key={level.name}>
                    <strong>{level.name}:</strong>{" "}
                    {level.benefitDescription ||
                      `Đạt từ ${level.min} điểm thành viên.`}
                  </p>
                ))}
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
                <p>Điểm sẽ được cộng khi đơn hàng hoàn thành hoặc đặt chỗ được xác nhận.</p>
              </div>

              <div className="account-content-card">
                <h2>Lịch sử hạng thành viên</h2>

                <div className="rank-history">
                  {levels.map((level) => (
                    <div key={level.name}>
                      <span>{level.name}</span>
                      <strong>{level.min} điểm</strong>
                    </div>
                  ))}
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