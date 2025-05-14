import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type HeaderProps = {
  onLogout: () => void;
};

function Header({ onLogout }: HeaderProps) {
  const [name, setName] = useState("");
  const [departement, setDepartement] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const nama = Cookies.get("nama") || "";
    const departement = Cookies.get("departemen") || "";
    const role = Cookies.get("role") || "";
    setName(nama);
    setDepartement(departement);
    setRole(role);
  }, []);
  return (
    <header
      className="header fixed top-0 z-10 left-0 right-0 flex items-stretch shrink-0 bg-[#fefefe] dark:bg-coal-500"
      data-sticky="true"
      data-sticky-class="shadow-sm dark:border-b dark:border-b-coal-100"
      data-sticky-name="header"
      id="header"
    >
      {/* begin: container */}
      <div
        className="container-fixed flex justify-between items-stretch lg:gap-4"
        id="header_container"
      >
        <div className="flex gap-1 lg:hidden items-center -ml-1">
          <a className="shrink-0" href="html/demo1.html">
            <img
              alt=""
              className="max-h-[25px] w-full"
              src="/media/app/mini-logo.svg"
            />
          </a>
          <div className="flex items-center">
            <button
              className="btn btn-icon btn-light btn-clear btn-sm"
              data-drawer-toggle="#sidebar"
            >
              <i className="ki-filled ki-menu"></i>
            </button>
            <button
              className="btn btn-icon btn-light btn-clear btn-sm"
              data-drawer-toggle="#megamenu_wrapper"
            >
              <i className="ki-filled ki-burger-menu-2"></i>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3.5 ml-auto">
          <div
            className="dropdown"
            data-dropdown="true"
            data-dropdown-offset="70px, 10px"
            data-dropdown-placement="bottom-end"
            data-dropdown-trigger="click|lg:click"
          >
            <button className="dropdown-toggle btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
              <i className="ki-filled ki-notification-on"></i>
              <span className="badge badge-dot badge-success size-[5px] absolute top-0.5 right-0.5 transform translate-y-1/2"></span>
            </button>
            <div className="dropdown-content light:border-gray-300 w-full max-w-[460px]">
              <div
                className="flex items-center justify-between gap-2.5 text-sm text-gray-900 font-semibold px-5 py-2.5"
                id="notifications_header"
              >
                Notifications
                <button
                  className="btn btn-sm btn-icon btn-light btn-clear shrink-0"
                  data-dropdown-dismiss="true"
                >
                  <i className="ki-filled ki-cross"></i>
                </button>
              </div>
              <div className="border-b border-b-gray-200"></div>
              <div className="grow" id="notifications_tab_all">
                <div className="flex flex-col">
                  <div
                    className="scrollable-y-auto"
                    data-scrollable="true"
                    data-scrollable-dependencies="#header"
                    data-scrollable-max-height="auto"
                    data-scrollable-offset="200px"
                  >
                    <div className="flex flex-col gap-5 pt-3 pb-4 divider-y divider-gray-200">
                      <div className="flex grow gap-2.5 px-5">
                        <div className="relative shrink-0 mt-0.5">
                          <img
                            alt=""
                            className="rounded-full size-8"
                            src="/media/avatars/300-5.png"
                          />
                          <span className="size-1.5 badge badge-circle badge-success absolute top-7 end-0.5 ring-1 ring-light transform -translate-y-1/2"></span>
                        </div>
                        <div className="flex flex-col gap-3.5">
                          <div className="flex flex-col gap-1">
                            <div className="text-2sm font-medium mb-px">
                              <a
                                className="hover:text-primary-active text-gray-900 font-semibold"
                                href="#"
                              >
                                Leslie Alexander
                              </a>
                              <span className="text-gray-700">
                                added new tags to
                              </span>
                              <a
                                className="hover:text-primary-active text-primary"
                                href="#"
                              >
                                Web Redesign 2024
                              </a>
                            </div>
                            <span className="flex items-center text-2xs font-medium text-gray-500">
                              53 mins ago
                              <span className="badge badge-circle bg-gray-500 size-1 mx-1.5"></span>
                              ACME
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            <span className="badge badge-sm badge-info badge-outline">
                              Client-Request
                            </span>
                            <span className="badge badge-sm badge-warning badge-outline">
                              Figma
                            </span>
                            <span className="badge badge-sm badge-light badge-outline">
                              Redesign
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-b-gray-200"></div>
                  <div
                    className="grid grid-cols-2 p-5 gap-2.5"
                    id="notifications_all_footer"
                  >
                    <button className="btn btn-sm btn-light justify-center">
                      Archive all
                    </button>
                    <button className="btn btn-sm btn-light justify-center">
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="menu" data-menu="true">
            <div
              className="menu-item"
              data-menu-item-offset="20px, 10px"
              data-menu-item-placement="bottom-end"
              data-menu-item-toggle="dropdown"
              data-menu-item-trigger="click|lg:click"
            >
              <div className="menu-toggle btn btn-icon rounded-full">
                <img
                  alt=""
                  className="size-9 rounded-full border-2 border-success shrink-0"
                  src="/media/avatars/300-2.png"
                />
              </div>
              <div className="menu-dropdown menu-default light:border-gray-300 w-full max-w-[250px]">
                <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      alt=""
                      className="size-9 rounded-full border-2 border-success"
                      src="/media/avatars/300-2.png"
                    />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm text-gray-800 font-semibold leading-none">
                        {name}
                      </span>
                      <span className="text-sm text-gray-800 font-semibold leading-none">
                        {role}
                      </span>
                      <a
                        className="text-xs text-gray-600 hover:text-primary font-medium leading-none"
                        href="html/demo1/account/home/get-started.html"
                      >
                        {departement}
                      </a>
                    </div>
                  </div>
                  <span className="badge badge-xs badge-primary badge-outline">
                    Pro
                  </span>
                </div>
                <div className="menu-separator"></div>
                <div className="flex flex-col">
                  <div className="menu-item">
                    <a
                      className="menu-link"
                      href="html/demo1/account/home/user-profile.html"
                    >
                      <span className="menu-icon">
                        <i className="ki-filled ki-profile-circle"></i>
                      </span>
                      <span className="menu-title">My Profile</span>
                    </a>
                  </div>

                  <div className="flex flex-col">
                    <div className="menu-item mb-0.5">
                      <div className="menu-link">
                        <span className="menu-icon">
                          <i className="ki-filled ki-moon"></i>
                        </span>
                        <span className="menu-title">Dark Mode</span>
                        <label className="switch switch-sm">
                          <input
                            data-theme-state="dark"
                            data-theme-toggle="true"
                            name="check"
                            type="checkbox"
                            defaultValue={1}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="menu-item px-4 py-1.5">
                      <button
                        className="btn btn-sm btn-light justify-center"
                        onClick={onLogout}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
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
