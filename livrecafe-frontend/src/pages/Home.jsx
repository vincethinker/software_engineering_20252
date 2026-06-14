import Header from "../components/Header";
import Footer from "../components/Footer";

import coffeeImg from "../assets/icons/coffee.png";
import spaceImg from "../assets/icons/space.png";

function Home() {
  return (
    <div className="page">
      <Header />

      <main className="home-content">
        <section className="home-section">
          <div className="home-text">
            <h1>ESPRESSO ĐẬM VỊ, LATTE ÊM MƯỢT</h1>
            <p>
              Từ hạt cà phê chọn lọc đến lớp sữa mềm mịn, Livrè mang đến
              hương vị ấm áp cho từng khoảnh khắc trong ngày.
            </p>
            <a href="/thuc-don">Khám phá thực đơn »</a>
          </div>

          <div className="polaroid polaroid-coffee">
            <img src={coffeeImg} alt="Cà phê Livrè" />
          </div>
        </section>

        <section className="home-section reverse">
          <div className="polaroid polaroid-space">
            <img src={spaceImg} alt="Không gian Livrè" />
          </div>

          <div className="home-text">
            <h1>SÁCH, CÀ PHÊ VÀ NHỮNG KHOẢNG LẶNG</h1>
            <p>
              Chọn một cuốn sách, gọi một ly cà phê và để Livrè trở thành góc
              nhỏ yên bình giữa ngày bận rộn.
            </p>
            <a href="/sach">Khám phá góc sách »</a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;