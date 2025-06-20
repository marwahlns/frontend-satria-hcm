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
  isWrapper?: boolean;
  isFixedContainer?: boolean;
}

const Main: React.FC<CardProps> = ({ children, isSidebar = true, isWrapper = true, isFixedContainer = true }) => {
  const router = useRouter();
  const containerClass = isFixedContainer ? "container-fixed" : "container-fluid";
  const layoutClass = isWrapper ? "wrapper flex grow flex-col" : "flex flex-col min-h-screen w-full";

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
        <div className={layoutClass}>
          <Header onLogout={handleLogout} isFixed={isSidebar}/>
          <main className="grow content pt-5" id="content" role="content">
            <div className={containerClass} id="content_container"></div>
            <div className={containerClass}>{children}</div>
          </main>
          <Footer />
        </div>
      </div>
      <SearchModal />
    </>
  );
};

export default Main;
