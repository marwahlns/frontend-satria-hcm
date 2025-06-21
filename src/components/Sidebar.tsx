import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import clsx from "clsx";

const SidebarMenuItems = ({
  href,
  title,
  icon,
  isActive,
}: {
  href: string;
  title: string;
  icon: string;
  isActive?: boolean;
}) => {
  return (
    <div className="menu-item">
      <Link href={href} passHref>
        <div
          className={`menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px] ${
            isActive ? "menu-item-active" : ""
          }`}
          tabIndex={0}
        >
          <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
            <i className={`${icon} text-lg`}></i>
          </span>
          <span
            className={`menu-title text-sm font-semibold ${
              isActive ? "text-primary" : "text-gray-700"
            }`}
          >
            {title}
          </span>
        </div>
      </Link>
    </div>
  );
};

// Komponen Dropdown
const SidebarAccordion = ({
  label,
  icon,
  open,
  toggle,
  menus,
  pathname,
}: {
  label: string;
  icon: string;
  open: boolean;
  toggle: () => void;
  menus: Array<{
    href: string;
    title: string;
  }>;
  pathname: string;
}) => {
  return (
    <div
      className="menu-item"
      data-menu-item-toggle="accordion"
      data-menu-item-trigger="click"
    >
      <div
        className="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] pl-[10px] pr-[10px] py-[6px]"
        tabIndex={0}
        onClick={toggle}
      >
        <span className="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
          <i className={`${icon} text-lg`}></i>
        </span>
        <span className="menu-title text-sm font-semibold text-gray-700 menu-item-active:text-primary menu-link-hover:!text-primary">
          {label}
        </span>
        <span className="menu-arrow text-gray-400 w-[20px] shrink-0 justify-end ml-1 mr-[-10px]">
          <i
            className={`ki-filled ${open ? "ki-minus" : "ki-plus"} text-2xs`}
          ></i>
        </span>
      </div>
      <div
        className={`menu-accordion ${
          open ? "show" : ""
        } gap-0.5 pl-[10px] relative before:absolute before:left-[20px] before:top-0 before:bottom-0 before:border-l before:border-gray-200`}
      >
        {menus.map((menu, index) => (
          <div
            key={index}
            className={`menu-item ${pathname === menu.href ? "active" : ""}`}
          >
            <Link
              className="menu-link gap-[14px] pl-[10px] pr-[10px] py-[8px] border border-transparent items-center grow menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg"
              href={menu.href}
              tabIndex={0}
            >
              <span className="menu-bullet flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></span>
              <span className="menu-title text-2sm font-medium text-gray-700 menu-item-active:text-primary menu-item-active:font-semibold menu-link-hover:!text-primary">
                {menu.title}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("");
  const [nrp, setNrp] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);

  useEffect(() => {
    const userRole = Cookies.get("role");
    const userNrp = Cookies.get("nrp");
    const deptHead = Cookies.get("dept_head");
    setRole(userRole || "guest");
    setNrp(userNrp);
    setDeptHead(deptHead);
  }, []);

  const masterDataMenus = [
    { href: "/master/leave-type", title: "Master Leave Type" },
    { href: "/master/shift", title: "Master Shift" },
    { href: "/master/shift-group", title: "Master Shift Group" },
    { href: "/master/employee", title: "Master User" },
    { href: "/master/worklocation", title: "Master Worklocation" },
  ];

  const transactionMenus = [
    { href: "/transaction/shift-emp", title: "Transaction Shift" },
    { href: "/transaction/leave-quota", title: "Transaction Leave Quota" },
  ];

  const submissionMenus = [
    { href: "/submission/leave-approval", title: "Leave" },
    { href: "/submission/overtime-approval", title: "Overtime" },
    { href: "/submission/officialTravel-approval", title: "Official Travel" },
    { href: "/submission/mutation-approval", title: "Mutation" },
    { href: "/submission/resign-approval", title: "Resign" },
    { href: "/submission/declaration-approval", title: "Declaration" },
  ];

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
            src="/media/app/default-logo.png"
          />
          <img
            alt=""
            className="small-logo min-h-[22px] max-w-150px"
            src="/media/app/mini-logo.png"
          />
        </a>
        <a className="hidden dark:block" href="html/demo1.html">
          <img
            alt=""
            className="default-logo min-h-[22px] max-w-150px"
            src="/media/app/default-logo.png"
          />
          <img
            alt=""
            className="small-logo min-h-[22px] max-w-150px"
            src="/media/app/mini-logo.png"
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
            <SidebarMenuItems
              href="/dashboard"
              title="Dashboards"
              icon="ki-filled ki-graph-3"
              isActive={pathname === "/dashboard"}
            />

            {nrp === "P0120001" && (
              <>
                <SidebarMenuItems
                  href="/attendance/attendance-employee"
                  title="Attendance"
                  icon="ki-filled ki-user-square"
                  isActive={pathname === "/attendance/attendance-employee"}
                />

                <SidebarAccordion
                  label="Master Data"
                  icon="ki-filled ki-data"
                  open={masterDataOpen || pathname.includes("/master")}
                  toggle={() => setMasterDataOpen(!masterDataOpen)}
                  menus={masterDataMenus}
                  pathname={pathname}
                />

                <SidebarAccordion
                  label="Transaction"
                  icon="ki-filled ki-note-2"
                  open={transactionOpen || pathname.includes("/transaction")}
                  toggle={() => setTransactionOpen(!transactionOpen)}
                  menus={transactionMenus}
                  pathname={pathname}
                />
              </>
            )}
            <SidebarAccordion
              label="Submission"
              icon="ki-filled ki-directbox-default"
              open={submissionOpen || pathname.includes("/submission")}
              toggle={() => setSubmissionOpen(!submissionOpen)}
              menus={submissionMenus}
              pathname={pathname}
            />
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
