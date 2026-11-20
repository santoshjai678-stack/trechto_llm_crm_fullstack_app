import Header from "./elements/Header";
import Sidebar from "./elements/Sidebar";
import Footer from "./elements/Footer";

const AppLayout = ({ children }) => {
  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
