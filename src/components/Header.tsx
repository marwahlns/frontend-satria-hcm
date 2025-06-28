import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type HeaderProps = {
  onLogout: () => void;
  isFixed: boolean;
};

function Header({ onLogout, isFixed = true }: HeaderProps) {
  const [name, setName] = useState("");
  const [departement, setDepartement] = useState("");

  useEffect(() => {
    const nama = Cookies.get("user_name") || "";
    const departement = Cookies.get("user_department") || "";
    setName(nama);
    setDepartement(departement);
  }, []);
  return (
    <header
      className={`header ${isFixed ? "fixed" : "fluid"} top-0 z-10 left-0 right-0 flex items-stretch shrink-0 !bg-[#fefefe] shadow !dark:bg-coal-500`}
      data-sticky="true"
      data-sticky-class="shadow-sm dark:border-b dark:border-b-coal-100"
      data-sticky-name="header"
      id="header"
    >
      {/* begin: container */}
      <div
        className={`${isFixed ? "container-fixed" : "container-fluid"} flex justify-between items-stretch lg:gap-4`}
        id="header_container"
      >
        <div className="flex gap-1 lg:hidden items-center -ml-1">
          <a className="shrink-0" href="html/demo1.html">
            <img
              alt=""
              className="max-h-[25px] w-full"
              src="/media/app/mini-logo.png"
            />
          </a>
          <div className="flex items-center">
            <button
              className="btn btn-icon btn-light btn-clear btn-sm"
              data-drawer-toggle="#sidebar"
            >
              <i className="ki-filled ki-menu"></i>
            </button>
          </div>
        </div>
        {!isFixed && (
          <div className="hidden lg:flex items-center">
            <img
              alt=""
              className="default-logo max-h-[100px] max-w-[200px]"
              src="/media/app/default-logo.png"
            />
          </div>
        )}
        <div className="flex items-center gap-2 lg:gap-3.5 ml-auto">
          <div className="menu" data-menu="true">
            <div
              className="menu-item"
              data-menu-item-offset="20px, 10px"
              data-menu-item-placement="bottom-end"
              data-menu-item-toggle="dropdown"
              data-menu-item-trigger="click|lg:click"
            >
              <div className="menu-toggle flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">Hai, {name}</span>
                <img
                  alt=""
                  className="size-9 rounded-full border-2 border-success shrink-0"
                  src="/media/avatars/300-2.png"
                />
              </div>
              <div className="menu-dropdown menu-default w-full max-w-[200px]">
                <div className="menu-item">
                  <button className="menu-link" onClick={onLogout}>
                    <span className="menu-title">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
