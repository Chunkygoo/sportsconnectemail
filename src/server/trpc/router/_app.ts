import { router } from "../trpc";
import { emailRouter } from "./email";
import { universityRouter } from "./universities";
import { userInfoRouter } from "./userInfo";

export const appRouter = router({
  userInfo: userInfoRouter,
  university: universityRouter,
  email: emailRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
