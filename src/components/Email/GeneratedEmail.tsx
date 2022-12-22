import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "react-toastify";
import { generateClickedAtom, savedCoachesAtom } from "../../atoms/emailAtoms";
import { emailTemplate } from "../../data/emailTemplate";

export default function GeneratedEmail() {
  const [savedCoaches] = useAtom(savedCoachesAtom);
  const [generateClicked] = useAtom(generateClickedAtom);
  const [emailContent, setEmailContent] = useState(emailTemplate);

  if (!generateClicked) {
    return (
      <div>
        You need to select some coaches first to see the generated email.
      </div>
    );
  }

  return (
    <div>
      <div className=" text-center">
        This email will be sent to {savedCoaches.length} coach
        {savedCoaches.length > 1 && "es "}
        {savedCoaches && savedCoaches.length > 0 && (
          <span>
            :
            {savedCoaches
              .map((savedCoach) => savedCoach.email)
              .map((coachEmail, i, self) => {
                if (i + 1 === self.length) {
                  return (
                    <span
                      key={i}
                      className={
                        "text-blue-500 underline" +
                        (self.length === 1 ? " ml-1" : "")
                      }
                    >
                      {coachEmail}
                    </span>
                  );
                } else {
                  return (
                    <span key={i}>
                      <span className="ml-2 text-blue-500 underline">
                        {coachEmail}
                      </span>
                      ,{" "}
                    </span>
                  );
                }
              })}
          </span>
        )}
      </div>
      <div className="mt-4 mb-4 flex-grow border-t border-gray-400"></div>
      <textarea
        rows={25}
        aria-label="Email"
        className=" w-full whitespace-pre-line border-2 border-black p-2"
        value={emailContent}
        onChange={(e) => {
          const newEmailContent = e.target.value;
          console.log(newEmailContent);
          if (
            (newEmailContent.match(/COACH_NAME/g) || []).length === 0 ||
            (newEmailContent.match(/UNIVERSITY_NAME/g) || []).length === 0 ||
            (newEmailContent.match(/PLAYER_NAME/g) || []).length === 0
          ) {
            toast.error(
              "In your email, do not delete: COACH_NAME, UNIVERSITY_NAME, PLAYER_NAME",
              {
                position: toast.POSITION.BOTTOM_RIGHT,
              }
            );
            return;
          } else if (
            (newEmailContent.match(/COACH_NAME]/g) || []).length > 1 ||
            (newEmailContent.match(/UNIVERSITY_NAME/g) || []).length > 1 ||
            (newEmailContent.match(/PLAYER_NAME/g) || []).length > 1
          ) {
            toast.error(
              "In your email, do not add/modify: COACH_NAME, UNIVERSITY_NAME, PLAYER_NAME",
              {
                position: toast.POSITION.BOTTOM_RIGHT,
              }
            );
            return;
          }
          setEmailContent(newEmailContent);
        }}
      />
      <button
        type="button"
        onClick={() => {
          console.log("send");
        }}
        className="rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium text-white
        hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300"
      >
        Send
      </button>
    </div>
  );
}
