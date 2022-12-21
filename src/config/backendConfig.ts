import SessionNode from "supertokens-node/recipe/session";
import ThirdPartyEmailPasswordNode from "supertokens-node/recipe/thirdpartyemailpassword";
import type { TypeInput } from "supertokens-node/types";
import { env } from "../env/server.mjs";

export const backendConfig = (): TypeInput => {
  return {
    framework: "express",
    supertokens: {
      connectionURI: env.SUPERTOKENS_CONNECTION_URI,
      apiKey: env.SUPERTOKENS_API_KEY,
    },
    appInfo: {
      appName: "Subbies",
      apiDomain: env.NEXT_PUBLIC_APP_URL,
      websiteDomain: env.NEXT_PUBLIC_APP_URL,
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [ThirdPartyEmailPasswordNode.init({}), SessionNode.init()],
    isInServerlessEnv: true,
  };
};
