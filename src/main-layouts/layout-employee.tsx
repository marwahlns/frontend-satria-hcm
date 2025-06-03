import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SearchModal from "../components/SearchModal";
import React, { ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

interface CardProps {
  children: ReactNode;
}

const LayoutEmployee: React.FC<CardProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  };

  return (
    <>
      <div className="flex grow">
        <div className="flex flex-col min-h-screen w-full">
          <Header onLogout={handleLogout} isFixed/>
          <main className="grow content pt-5" id="content" role="content">
            <div className="container-fluid" id="content_container"></div>
            <div className="container-fluid">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
      <SearchModal />
    </>
  );
};

export default LayoutEmployee;
