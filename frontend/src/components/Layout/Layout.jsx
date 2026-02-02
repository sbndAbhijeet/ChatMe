import React from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./SideBar";
import { layoutRoutes } from "../../config/layoutRoutes";

const Layout = () => {
  const location = useLocation();

  const matchedRoute = layoutRoutes.find(r =>
    matchPath({ path: r.pattern, end: false }, location.pathname)
  );

  const showSidebar = matchedRoute?.sidebar;
  const showHeader = matchedRoute ? matchedRoute.header : true;
  const showFooter = matchedRoute ? matchedRoute.footer : true;

  return (
    <div className="flex flex-col min-h-screen bg-[#F2E3BC]/10">

      {showHeader && <Header />}

      <div className="flex flex-1 overflow-hidden">

        {showSidebar && (
          <div className="shrink-0 bg-[#414535]">
            <Sidebar type={matchedRoute?.type} />
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-auto">
          <Outlet />
          {showFooter && <Footer />}
        </main>

      </div>
    </div>
  );
};

export default Layout;
