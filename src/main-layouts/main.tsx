import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SearchModal from "../components/SearchModal";
import React, { ReactNode, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

interface CardProps {
  children: ReactNode;
  isSidebar?: boolean;
}

const Main: React.FC<CardProps> = ({ children, isSidebar = true }) => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  };

  useEffect(() => {
    const role = Cookies.get("role");
    console.log("Role from cookies:", role);
  }, []);

  return (
    <>
      <div className="flex grow">
        {isSidebar && <Sidebar />}

        <div className="wrapper flex grow flex-col">
          <Header onLogout={handleLogout} />
          <main className="grow content pt-5" id="content" role="content">
            <div className="container-fixed" id="content_container"></div>
            <div className="container-fixed">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
      <SearchModal />
    </>
  );
};

export default Main;
