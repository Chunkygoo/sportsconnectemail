import { useRouter } from "next/router";
import {
  SessionAuth as STSessionAuth,
  useSessionContext,
} from "supertokens-auth-react/recipe/session";
import Spinner from "../Common/Spinner";

export default function SessionAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSessionContext();
  const loading = session.loading;
  const loadedNotAuth = !session.loading && !session.doesSessionExist;

  if (loading || loadedNotAuth) {
    if (loadedNotAuth) {
      router.push("/auth/loginsignup?from=sessionAuth");
    }
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">
          <Spinner size="12" />
          Loading...
        </div>
      </div>
    );
  }

  return <STSessionAuth>{children}</STSessionAuth>;
}
