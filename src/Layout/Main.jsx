import { Outlet } from "react-router-dom";
import VerificationStatusListener from "../Components/VerificationStatusListener";

const Main = () => {
  return (
    <div>
      {/* Global verification status listener */}
      <VerificationStatusListener />
      <Outlet />
    </div>
  );
};

export default Main;
