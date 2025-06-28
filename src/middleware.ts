import { NextRequest, NextResponse } from "next/server";

const baseProtectedPaths = [
  "/attendance",
  "/dashboard",
  "/master",
  "/submission",
  "/transaction",
];

const publicRoutes = ["/auth/login"];

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;
  const roleRaw = req.cookies.get("role")?.value;
  const role = (roleRaw === "null" || roleRaw === "undefined") ? "" : roleRaw;
  const nrp = req.cookies.get("nrp")?.value;

  const isPublicRoute = publicRoutes.includes(path);
  const isProtectedPath = path === '/' || baseProtectedPaths.some(basePath => path.startsWith(basePath));

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  if (token && isProtectedPath) {
    if (nrp === "P0120001") {
      const adminAllowedPaths = [
        "/dashboard",
        "/attendance/attendance-detail",
        "/attendance/attendance-employee",
        "/master/employee",
        "/master/leave-type",
        "/master/shift",
        "/master/shift-group",
        "/master/worklocation",
        "/transaction/leave-quota",
        "/transaction/shift-emp",
        "/submission/declaration-approval",
        "/submission/leave-approval",
        "/submission/mutation-approval",
        "/submission/officialTravel-approval",
        "/submission/overtime-approval",
        "/submission/resign-approval",
      ];
      if (!adminAllowedPaths.includes(path)) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      }
      return NextResponse.next();
    }

    if (role === "10") {
      if (path !== "/dashboard/dashboardEmployee" && path !== "/") {
        return NextResponse.redirect(new URL("/dashboard/dashboardEmployee", req.nextUrl));
      }
      return NextResponse.next();
    }

    // APPROVER
    if (role === "") {
      const approverAllowedPaths = [
        "/dashboard",
        "/submission/declaration-approval",
        "/submission/leave-approval",
        "/submission/mutation-approval",
        "/submission/officialTravel-approval",
        "/submission/overtime-approval",
        "/submission/resign-approval",
      ];
      if (!approverAllowedPaths.includes(path)) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};