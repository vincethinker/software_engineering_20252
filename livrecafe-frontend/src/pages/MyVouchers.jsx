import Header from "../components/Header";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";

function MyVouchers() {
  const vouchers = [];

  return (
    <div className="page">
      <Header />

      <main className="account-main">
        <div className="account-breadcrumb">
          <span>Trang chủ</span> / <strong>Tài khoản</strong>
        </div>

        <div className="account-layout">
          <AccountSidebar />

          <section className="account-content-card vouchers-card">
            <h1>Ưu đãi của tôi</h1>

            {vouchers.length === 0 ? (
              <div className="empty-state">Không có dữ liệu</div>
            ) : (
              <div className="voucher-list">
                {vouchers.map((voucher) => (
                  <div className="voucher-item" key={voucher.id}>
                    {voucher.name}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyVouchers;