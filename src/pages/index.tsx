import { useAtom } from "jotai";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import { signOut } from "supertokens-auth-react/lib/build/recipe/thirdpartyemailpassword";
import { usernameAtom } from "../atoms/appAtoms";
import SessionAuth from "../components/Auth/SessionAuth";
import Spinner from "../components/Common/Spinner";
import GenerateEmail from "../components/Email/GenerateEmail";
import GeneratedEmail from "../components/Email/GeneratedEmail";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  // useEffect(() => {
  //   const helper = async () => {
  //     let res = await getCurrentUser();
  //     if (res?.status === 200) {
  //       if (res?.data.role !== 'admin') {
  //         await reactAdminSignOut();
  //       } else {
  //         setLoggedInUser(res.data);
  //       }
  //     }
  //     setLoading(false);
  //   };
  //   helper();
  // }, [reactAdminSignOut]);
  const [isAdmin, setIsAAdmin] = useState(false);
  const [username, setUsername] = useAtom(usernameAtom);
  const router = useRouter();
  const logOutHelper = async () => {
    await signOut();
    router.push("/auth/login");
  };
  const { isLoading } = trpc.userInfo.getCurrentUserInfo.useQuery(undefined, {
    async onSuccess(data) {
      const { role, name } = data;
      if (role !== "ADMIN") {
        await logOutHelper();
        toast.error("This attempt to escalate privilege has been logged.", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      } else {
        setIsAAdmin(true);
        if (name) setUsername(name);
      }
    },
    async onError() {
      await logOutHelper();
    },
  });
  if (isLoading || !isAdmin) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <SessionAuth>
            <Spinner size="12" />
          </SessionAuth>
        </div>
      </div>
    );
  }
  return (
    <SessionAuth>
      <h1 className="absolute top-2 left-4">
        Welcome back <span className="ml-2 text-blue-500">{username}</span>
      </h1>
      <button
        type="button"
        onClick={logOutHelper}
        className="absolute top-2 right-4 rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium
        text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Log out
      </button>
      <div className="flex h-screen">
        <div className="flex w-[50%] justify-center">
          <div className="m-auto w-[80%]">
            <GenerateEmail />
          </div>
        </div>
        <span className="border-r-2 border-black"></span>
        <div className="flex w-[50%] justify-center">
          <div className="m-auto max-h-[80%] w-[80%]">
            <GeneratedEmail />
          </div>
        </div>
      </div>
    </SessionAuth>
  );
};

export default Home;
