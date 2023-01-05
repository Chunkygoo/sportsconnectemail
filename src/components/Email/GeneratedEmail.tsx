import ProgressBar from "@ramonak/react-progress-bar";
import { useAtom } from "jotai";
import { useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { playerNameAtom, savedCoachesAtom } from "../../atoms/emailAtoms";
import { emailTemplate } from "../../data/emailTemplate";
import { trpc } from "../../utils/trpc";

export default function GeneratedEmail() {
  const [playerName] = useAtom(playerNameAtom);
  const [savedCoaches, setSavedCoaches] = useAtom(savedCoachesAtom);
  const [emailContent, setEmailContent] = useState(emailTemplate);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [numberOfEmailsSent, setNumberOfEmailsSent] = useState(1);
  const [emailsSentPercentage, setEmailsSentPercentage] = useState(0);

  const { mutateAsync: sendEmail } = trpc.email.sendEmail.useMutation({
    onSuccess() {
      setEmailsSentPercentage(
        Math.round((numberOfEmailsSent / savedCoaches.length) * 100)
      );
      setNumberOfEmailsSent((prev) => prev + 1);
    },
  });

  if (savedCoaches.length === 0) {
    return (
      <div>
        You need to select some coaches first to see the generated email.
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
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
            (newEmailContent.match(/COACH_NAME/g) || []).length > 1 ||
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
        onClick={async () => {
          let emailsSent = 0;
          setModalIsOpen(true);
          try {
            for (let i = 0; i < savedCoaches.length; i++) {
              const coach = savedCoaches[i];
              if (coach)
                await sendEmail({
                  playerName: playerName,
                  coach: coach,
                  emailTemplate: emailContent,
                });
              emailsSent++;
            }
            toast.success("All emails sent ✅", {
              position: toast.POSITION.BOTTOM_RIGHT,
            });
          } catch (error) {
            toast.error("An error occured while sending your email", {
              position: toast.POSITION.BOTTOM_RIGHT,
            });
            const element = document.createElement("a");
            const file = new Blob(
              [`Number of emails sent = ${emailsSent}` as BlobPart],
              {
                type: "text/plain",
              }
            );
            element.href = URL.createObjectURL(file);
            element.download = `Number of emails sent.txt`;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
          } finally {
            const element = document.createElement("a");
            const file = new Blob(
              savedCoaches.map((coach) => `${coach.email}\n`),
              { type: "text/plain" }
            );
            element.href = URL.createObjectURL(file);

            const currentdate = new Date();
            const datetime =
              "at date " +
              currentdate.getDate() +
              "_" +
              (currentdate.getMonth() + 1) +
              "_" +
              currentdate.getFullYear() +
              ", time " +
              currentdate.getHours() +
              "_" +
              currentdate.getMinutes();

            element.download = `coachEmails for ${playerName} (${datetime}).txt`;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();

            setSavedCoaches([]);
            setModalIsOpen(false);
            setNumberOfEmailsSent(0);
          }
        }}
        disabled={savedCoaches.length === 0 || playerName === ""}
        className="rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium text-white
        hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300"
      >
        Send and download emails
      </button>
      <Modal
        isOpen={modalIsOpen}
        ariaHideApp={false}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
        contentLabel="Example Modal"
      >
        <div>Do not refresh the page. Sending emails...</div>
        <br />
        <ProgressBar completed={emailsSentPercentage} />
      </Modal>
    </div>
  );
}
