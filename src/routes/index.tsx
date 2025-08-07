import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "./member/SignInPage";
import SignUpPage from "./member/SignUpPage";
import FindPasswordPage from "./member/FindPasswordPage";
import HostSignUpPage from "./member/HostSignUpPage";
import Default from "./layouts/Default";
import Home from "./Home";

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
