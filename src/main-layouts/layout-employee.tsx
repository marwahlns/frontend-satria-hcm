import Footer from "../components/Footer";
import Header from "../components/Header";
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
      <div className="flex flex-col min-h-screen w-full">
        <Header onLogout={handleLogout} />

        <main
          className="flex-grow w-full max-w-screen-lg mx-auto px-4"
          role="content"
        >
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LayoutEmployee;
