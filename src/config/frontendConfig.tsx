import Router from "next/router";
import type { SuperTokensConfig } from "supertokens-auth-react/lib/build/types.js";
import SessionReact from "supertokens-auth-react/recipe/session";
import ThirdPartyEmailPassword from "supertokens-auth-react/recipe/thirdpartyemailpassword";
import type { WindowHandlerInterface } from "supertokens-website/utils/windowHandler/types";
import { env } from "../env/client.mjs";

export const frontendConfig = (): SuperTokensConfig => {
  return {
    appInfo: {
      appName: "Subbies",
      apiDomain: env.NEXT_PUBLIC_APP_URL,
      websiteDomain: env.NEXT_PUBLIC_APP_URL,
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      SessionReact.init(),
      ThirdPartyEmailPassword.init({
        signInAndUpFeature: {
          disableDefaultUI: true,
        },
        style: {
          button: {
            backgroundColor: "#0076ff",
            border: "0px",
            margin: "0 auto",
          },
          superTokensBranding: {
            display: "none",
          },
          secondaryText: {
            display: "none",
          },
        },
      }),
    ],
    // this is so that the SDK uses the next router for navigation
    windowHandler: (oI: WindowHandlerInterface) => {
      return {
        ...oI,
        location: {
          ...oI.location,
          setHref: (href: string) => {
            Router.push(href);
          },
        },
      };
    },
  };
};
