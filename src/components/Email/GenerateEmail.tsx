import { useAtom } from "jotai";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import {
  generateClickedAtom,
  playerNameAtom,
  savedCoachesAtom,
} from "../../atoms/emailAtoms";
import { trpc } from "../../utils/trpc";

export type universityType = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  coaches: coachType[];
};

export type universityNoCoachType = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
};

export type coachType = {
  id: string;
  name: string;
  email: string | null;
  contactNumber: string | null;
  category: string;
  level: string;
  university: universityNoCoachType;
};

export default function GenerateEmail() {
  const [playerName, setPlayerName] = useAtom(playerNameAtom);
  const [savedCoaches, setSavedCoaches] = useAtom(savedCoachesAtom);
  const [_, setGenerateClicked] = useAtom(generateClickedAtom);
  const [searchedUni, setSearchedUni] = useState("");
  const [selectedUniId, setSelectedUniId] = useState("");

  const utils = trpc.useContext();
  const { data: uniData } = trpc.university.getUniversities.useQuery(
    {
      search: searchedUni,
    },
    {
      onSuccess(data) {
        setUnis(data);
      },
    }
  );
  const [unis, setUnis] = useState(uniData || []);

  const selectedUni = unis.find((uni) => uni.id === selectedUniId);

  const uniHeaders = ["id", "Name", "City", "State", "Category"];
  const coachesHeaders = [
    "id",
    "Name",
    "Email",
    "Contact",
    "Category",
    "Level",
  ];

  const removeEmail = (emailToRemove: string) => {
    const emailToRemoveIndex = savedCoaches.findIndex(
      (coach) => coach.email === emailToRemove
    );
    setSavedCoaches((prev) => {
      const newSavedCoachEmails = [...prev];
      if (emailToRemoveIndex !== -1)
        newSavedCoachEmails.splice(emailToRemoveIndex, 1);
      return newSavedCoachEmails;
    });
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2>Generate Email</h2>
      <label>
        Player name:
        <input
          type="text"
          className="ml-2 rounded-sm border-2 border-black"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </label>
      <h2>
        Selected University: {selectedUni?.name ? selectedUni?.name : "none"}
        <button
          type="button"
          className="mr-2 mb-2 ml-2 rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium
           text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => setSelectedUniId("")}
        >
          Clear
        </button>
      </h2>
      <label>
        Search unis :
        <DebounceInput
          debounceTimeout={1000}
          value={searchedUni}
          onChange={(e) => {
            setSearchedUni(e.target.value);
            utils.university.invalidate();
            console.log(unis);
          }}
          placeholder="Type to start searching... "
          className="ml-2 rounded-sm border-2 border-black"
        />
      </label>
      <div>
        {unis && unis.length > 0 && (
          <table className="border-2 border-gray-500">
            <thead>
              <tr>
                {uniHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unis.map((uni) => (
                <tr key={uni.id}>
                  <td>
                    <input
                      aria-label="checkbox"
                      type="checkbox"
                      onChange={() => {
                        if (selectedUniId === uni.id) {
                          setSelectedUniId("");
                        } else {
                          setSelectedUniId(uni.id);
                        }
                      }}
                      checked={uni.id === selectedUniId}
                    ></input>
                  </td>
                  <td>{uni.name}</td>
                  <td>{uni.city}</td>
                  <td>{uni.state}</td>
                  <td>{uni.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        {selectedUni?.coaches && selectedUni?.coaches.length > 0 && (
          <table className="border-2 border-gray-500">
            <thead>
              <tr>
                {coachesHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedUni?.coaches.map((coach: coachType) => (
                <tr key={coach.id}>
                  <td>
                    <div
                      className="m-1 rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium
                      text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      onClick={() => {
                        setSavedCoaches((prev) => {
                          if (prev.map((coach) => coach.id).includes(coach.id))
                            return prev;
                          if (!coach.email || coach.email === "") {
                            alert("This coach has no email. Cannot be added");
                            return prev;
                          }
                          const newSavedCoaches = [...prev, coach];
                          return newSavedCoaches;
                        });
                      }}
                    >
                      Add
                    </div>
                  </td>
                  <td>{coach.name}</td>
                  <td>{coach.email}</td>
                  <td>{coach.contactNumber}</td>
                  <td>{coach.category}</td>
                  <td>{coach.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        Saved emails:{" "}
        {savedCoaches && savedCoaches.length > 0 ? (
          <span>
            {savedCoaches
              .map((savedCoach) => savedCoach.email)
              .map((coachEmail, i, self) => {
                if (!coachEmail || coachEmail === "") {
                  alert("Should never get here.");
                  throw new Error("Should never get here.");
                }
                if (i + 1 === self.length) {
                  return (
                    <span key={i}>
                      <span className="mr-1 text-blue-500 underline">
                        {coachEmail}
                      </span>
                      <span
                        onClick={() => {
                          removeEmail(coachEmail);
                        }}
                        className="hover:cursor-pointer"
                      >
                        ❌
                      </span>
                    </span>
                  );
                } else {
                  return (
                    <span key={i}>
                      <span className="mr-1 text-blue-500 underline">
                        {coachEmail}
                      </span>
                      <span
                        onClick={() => {
                          removeEmail(coachEmail);
                        }}
                        className="hover:cursor-pointer"
                      >
                        ❌
                      </span>
                      ,{" "}
                    </span>
                  );
                }
              })}
          </span>
        ) : (
          "None"
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          savedCoaches.map((coach) => {
            if (coach.email && !validateEmail(coach.email)) {
              alert(`${coach.name} has an invalid email: ${coach.email}`);
              return;
            }
          });
          setGenerateClicked(true);
        }}
        disabled={savedCoaches.length === 0}
        className="rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium text-white
        hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300"
      >
        Generate
      </button>
    </div>
  );
}
