import { Outlet } from "react-router-dom";
import HrDivider from "@/components/HrDivider";

import cherry_blossom from "@shared/assets/images/cherry_blossom.png";

const Layout = () => {
  return (
    <div className="grid grid-cols-1 h-full w-full items-center justify-center bg-white">
      <header className="flex flex-col items-center justify-center font-alagard text-[20px]">
        <div className="w-full flex relative justify-center items-center h-[35px]">
          <img
            src={cherry_blossom}
            className="w-[23px] white-hard-border absolute left-[8px]"
          />
          <span>Swatch Book</span>
        </div>
        <HrDivider />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
