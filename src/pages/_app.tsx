import { type AppType } from "next/app";

import { Provider } from "jotai";
import { trpc } from "../utils/trpc";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuperTokensReact, { SuperTokensWrapper } from "supertokens-auth-react";
import { frontendConfig } from "../config/frontendConfig";
import "../styles/globals.css";

if (typeof window !== "undefined") {
  // we only want to call this init function on the frontend, so we check typeof window !== 'undefined'
  SuperTokensReact.init(frontendConfig());
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Provider>
      <SuperTokensWrapper>
        <Component {...pageProps} />
        <ToastContainer />
      </SuperTokensWrapper>
    </Provider>
  );
};

export default trpc.withTRPC(MyApp);
