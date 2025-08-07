import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Default from "./layouts/Default.tsx";
import SignInPage from "../pages/member/SignInPage.tsx";
import SignUpPage from "../pages/member/SignUpPage.tsx";
import FindPasswordPage from "../pages/member/FindPasswordPage.tsx";
import HostSignUpPage from "../pages/member/HostSignUpPage.tsx";
import Home from "../pages/Home.tsx";

const router = createBrowserRouter([
  {
    Component: Default,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "/find-password",
        element: <FindPasswordPage />,
      },
      {
        path: "/host-sign-up",
        element: <HostSignUpPage />,
      },
    ],
  },
]);

export default function Router() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
