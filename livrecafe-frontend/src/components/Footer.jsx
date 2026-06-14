import logoLarge from "../assets/icons/logo-large.png";
import facebookIcon from "../assets/icons/facebook.png";
import instagramIcon from "../assets/icons/instagram.png";
import youtubeIcon from "../assets/icons/youtube.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <img src={logoLarge} alt="Livrè Cafe" />
      </div>

      <div className="footer-column">
        <h3>VỀ LIVRÈ CAFE</h3>
        <p>Nguồn gốc</p>
        <p>Dịch vụ</p>
        <p>Nghề nghiệp</p>
        <p>Hỗ trợ</p>
      </div>

      <div className="footer-column">
        <h3>HỆ THỐNG CỬA HÀNG</h3>
        <p>Tìm cửa hàng gần nhất</p>
      </div>

      <div className="footer-column">
        <h3>TIN TỨC</h3>
      </div>

      <div className="footer-column">
        <h3>THEO DÕI CHÚNG TÔI</h3>

        <div className="social-icons">
          <img src={facebookIcon} alt="Facebook" />
          <img src={instagramIcon} alt="Instagram" />
          <img src={youtubeIcon} alt="Youtube" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;