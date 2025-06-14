import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("");
  const [nrp, setNrp] = useState("");
  const [deptHead, setDeptHead] = useState("");

  useEffect(() => {
    const userRole = Cookies.get("role");
    const userNrp = Cookies.get("nrp");
    const deptHead = Cookies.get("dept_head");
    setRole(userRole || "guest");
    setNrp(userNrp);
    setDeptHead(deptHead);
  }, []);

  return (
    <div
      className="sidebar dark:bg-coal-600 bg-light border-r border-r-gray-200 dark:border-r-coal-100 fixed top-0 bottom-0 z-20 hidden lg:flex flex-col items-stretch shrink-0"
      data-drawer="true"
      data-drawer-class="drawer drawer-start top-0 bottom-0"
      data-drawer-enable="true|lg:false"
      id="sidebar"
    >
      <div
        className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
        id="sidebar_header"
      >
        <a className="dark:hidden" href="html/demo1.html">
          <img
            alt=""
            className="default-logo min-h-[22px] max-w-150px"
            src="/media/app/logo_image.png"
          />
          <img
            alt=""
            className="small-logo min-h-[22px] max-w-150px"
            src="/media/app/logo_image.png"
          />
        </a>
        <a className="hidden dark:block" href="html/demo1.html">
          <img
            alt=""
            className="default-logo min-h-[22px] max-w-150px"
            src="/media/app/logo_image.png"
          />
          <img
            alt=""
            className="small-logo min-h-[22px] max-w-150px"
            src="/media/app/logo_image.png"
          />
        </a>
        <button
          className="btn btn-icon btn-icon-md size-[30px] rounded-lg border border-gray-200 dark:border-gray-300 bg-light text-gray-500 hover:text-gray-700 toggle absolute left-full top-2/4 -translate-x-2/4 -translate-y-2/4"
          data-toggle="body"
          data-toggle-class="sidebar-collapse"
          id="sidebar_toggle"
        >
          <i className="ki-filled ki-black-left-line toggle-active:rotate-180 transition-all duration-300"></i>
        </button>
      </div>
      <div
        className="sidebar-content flex grow shrink-0 py-5 pr-2"
        id="sidebar_content"
      >
        <div
          className="scrollable-y-hover grow shrink-0 flex pl-2 lg:pl-5 pr-1 lg:pr-3"
          data-scrollable="true"
          data-scrollable-dependencies="#sidebar_header"
          data-scrollable-height="auto"
          data-scrollable-offset="0px"
          data-scrollable-wrappers="#sidebar_content"
          id="sidebar_scrollable"
        >
          <div
            className="menu flex flex-col grow gap-0.5"
            data-menu="true"
            data-menu-accordion-expand-all="false"
            id="sidebar_menu"
          >
            <div
              className="menu-item"
              data-menu-item-toggle="accordion"
              data-menu-item-trigger="click"
            >
              <Link href="/dashboard" passHref>
                <div
                  className="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px]"
                  tabIndex={0}
                >
                  <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
                    <i className="ki-filled ki-element-11 text-lg"></i>
                  </span>
                  <span className="menu-title text-sm font-semibold text-gray-700 menu-item-active:text-primary menu-link-hover:!text-primary">
                    Dashboards
                  </span>
                </div>
              </Link>
            </div>
            {nrp === "P0120001" && (
              <div
                className="menu-item"
                data-menu-item-toggle="accordion"
                data-menu-item-trigger="click"
              >
                <div
                  className="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px]"
                  tabIndex={0}
                >
                  <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
                    <i className="ki-filled ki-profile-circle text-lg"></i>
                  </span>
                  <span className="menu-title text-sm font-semibold text-gray-700 menu-item-active:text-primary menu-link-hover:!text-primary">
                    Master Data
                  </span>
                  <span className="menu-arrow text-gray-400 w-[20px] shrink-0 justify-end ml-1 mr-[-10px]">
                    <i className="ki-filled ki-plus text-2xs menu-item-show:hidden"></i>
                    <i className="ki-filled ki-minus text-2xs hidden menu-item-show:inline-flex"></i>
                  </span>
                </div>
                <div
                  className={`menu-accordion ${
                    pathname.includes("/master") ? "show" : ""
                  } gap-0.5 pl-[10px] relative before:absolute before:left-[20px] before:top-0 before:bottom-0 before:border-l before:border-gray-200`}
                >
                  <div
                    className={`menu-item ${
                      pathname === "/master/employee" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/master/employee"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Master User
                      </span>
                    </Link>
                  </div>
                  <div
                    className={`menu-item ${
                      pathname === "/master/worklocation" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/master/worklocation"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Master Worklocation
                      </span>
                    </Link>
                  </div>
                  <div
                    className={`menu-item ${
                      pathname === "/master/shift" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/master/shift"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Master Shift
                      </span>
                    </Link>
                  </div>
                  <div
                    className={`menu-item ${
                      pathname === "/master/shift-group" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/master/shift-group"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Master Shift Group
                      </span>
                    </Link>
                  </div>
                  <div
                    className={`menu-item ${
                      pathname === "/master/leave-type" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/master/leave-type"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Master Leave Type
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {nrp === "P0120001" && (
              <div
                className="menu-item"
                data-menu-item-toggle="accordion"
                data-menu-item-trigger="click"
              >
                <div
                  className="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px]"
                  tabIndex={0}
                >
                  <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
                    <i className="ki-filled ki-night-day text-lg"></i>
                  </span>
                  <span className="menu-title text-sm font-semibold text-gray-700 menu-item-active:text-primary menu-link-hover:!text-primary">
                    Transaction
                  </span>
                  <span className="menu-arrow text-gray-400 w-[20px] shrink-0 justify-end ml-1 mr-[-10px]">
                    <i className="ki-filled ki-plus text-2xs menu-item-show:hidden"></i>
                    <i className="ki-filled ki-minus text-2xs hidden menu-item-show:inline-flex"></i>
                  </span>
                </div>
                <div
                  className={`menu-accordion ${
                    pathname.includes("/transaction") ? "show" : ""
                  } gap-0.5 pl-[10px] relative before:absolute before:left-[20px] before:top-0 before:bottom-0 before:border-l before:border-gray-200`}
                >
                  <div
                    className={`menu-item ${
                      pathname === "/transaction/shift-emp" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/transaction/shift-emp"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Transaction Shift
                      </span>
                    </Link>
                  </div>
                  <div
                    className={`menu-item ${
                      pathname === "/transaction/leave-quota" ? "active" : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/transaction/leave-quota"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Transaction Leave Quota
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {deptHead === "1" && (
              <div
                className="menu-item"
                data-menu-item-toggle="accordion"
                data-menu-item-trigger="click"
              >
                <div
                  className="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px]"
                  tabIndex={0}
                >
                  <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
                    <i className="ki-filled ki-night-day text-lg"></i>
                  </span>
                  <span className="menu-title text-sm font-semibold text-gray-700 menu-item-active:text-primary menu-link-hover:!text-primary">
                    Transaction
                  </span>
                  <span className="menu-arrow text-gray-400 w-[20px] shrink-0 justify-end ml-1 mr-[-10px]">
                    <i className="ki-filled ki-plus text-2xs menu-item-show:hidden"></i>
                    <i className="ki-filled ki-minus text-2xs hidden menu-item-show:inline-flex"></i>
                  </span>
                </div>

                <div
                  className={`menu-accordion ${
                    pathname.includes("/transaction") ? "show" : ""
                  } gap-0.5 pl-[10px] relative before:absolute before:left-[20px] before:top-0 before:bottom-0 before:border-l before:border-gray-200`}
                >
                  <div
                    className={`menu-item ${
                      pathname === "/transaction/mutation-submit"
                        ? "active"
                        : ""
                    }`}
                  >
                    <Link
                      className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                      href="/transaction/mutation-submit"
                      tabIndex={0}
                    >
                      <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                      <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                        Mutation Submit
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div
              className="menu-item"
              data-menu-item-toggle="accordion"
              data-menu-item-trigger="click"
            >
              <div
                className="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px]"
                tabIndex={0}
              >
                <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
                  <i className="ki-filled ki-night-day text-lg"></i>
                </span>
                <span className="menu-title text-sm font-semibold text-gray-700 menu-item-active:text-primary menu-link-hover:!text-primary">
                  Report
                </span>
                <span className="menu-arrow text-gray-400 w-[20px] shrink-0 justify-end ml-1 mr-[-10px]">
                  <i className="ki-filled ki-plus text-2xs menu-item-show:hidden"></i>
                  <i className="ki-filled ki-minus text-2xs hidden menu-item-show:inline-flex"></i>
                </span>
              </div>
              <div
                className={`menu-accordion ${
                  pathname.includes("/transaction") ? "show" : ""
                } gap-0.5 pl-[10px] relative before:absolute before:left-[20px] before:top-0 before:bottom-0 before:border-l before:border-gray-200`}
              >
                <div
                  className={`menu-item ${
                    pathname === "/transaction/leave-submitted" ? "active" : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/leave-submitted"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Leave Submission
                    </span>
                  </Link>
                </div>
                <div
                  className={`menu-item ${
                    pathname === "/transaction/overtime-submitted"
                      ? "active"
                      : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/overtime-submitted"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Overtime Submission
                    </span>
                  </Link>
                </div>
                <div
                  className={`menu-item ${
                    pathname === "/transaction/officialTravel-submitted"
                      ? "active"
                      : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/officialTravel-submitted"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Work Travel Submission
                    </span>
                  </Link>
                </div>
                <div
                  className={`menu-item ${
                    pathname === "/transaction/mutation-submitted"
                      ? "active"
                      : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/mutation-submitted"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Mutation Submission
                    </span>
                  </Link>
                </div>
                <div
                  className={`menu-item ${
                    pathname === "/transaction/resign-submitted" ? "active" : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/resign-submitted"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Resign Submission
                    </span>
                  </Link>
                </div>
                <div
                  className={`menu-item ${
                    pathname === "/transaction/declaration-submitted"
                      ? "active"
                      : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/declaration-submitted"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Declaration Submission
                    </span>
                  </Link>
                </div>
                <div
                  className={`menu-item ${
                    pathname === "/transaction/attendance-employee"
                      ? "active"
                      : ""
                  }`}
                >
                  <Link
                    className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
                    href="/transaction/attendance-employee"
                    tabIndex={0}
                  >
                    <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
                    <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                      Report Attendance Employee
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
