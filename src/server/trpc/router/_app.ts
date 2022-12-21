import { router } from "../trpc";
import { universityRouter } from "./universities";
import { userInfoRouter } from "./userInfo";

export const appRouter = router({
  userInfo: userInfoRouter,
  university: universityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
