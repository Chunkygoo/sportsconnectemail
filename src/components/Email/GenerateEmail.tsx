import { useAtom } from "jotai";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { playerNameAtom, savedCoachesAtom } from "../../atoms/emailAtoms";
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
  email: string;
  contactNumber: string | null;
  category: string;
  level: string;
  university: universityNoCoachType;
};

type coachTypeEmailNullable = Omit<coachType, "email"> & {
  email: string | null;
};

export default function GenerateEmail() {
  const [playerName, setPlayerName] = useAtom(playerNameAtom);
  const [savedCoaches, setSavedCoaches] = useAtom(savedCoachesAtom);
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
      const newSavedCoaches = [...prev];
      if (emailToRemoveIndex !== -1)
        newSavedCoaches.splice(emailToRemoveIndex, 1);
      return newSavedCoaches;
    });
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const getCoachesWithEmail = (coaches: coachTypeEmailNullable[]) => {
    const coachesWithNonNullEmail: coachType[] = [];
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      if (!coach || !coach.email || coach.email === "") continue;
      coachesWithNonNullEmail.push({
        ...coach,
        email: coach.email,
      });
    }
    return coachesWithNonNullEmail;
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-center">Generate Email</h2>
      <div className="mt-4 mb-4 flex-grow border-t border-gray-400"></div>
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
        Selected University:{" "}
        {selectedUni?.name
          ? `${selectedUni?.name} (${selectedUni?.category})`
          : "none"}
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
          <table className="table-fixed border-2 border-gray-500">
            <thead>
              <tr>
                {uniHeaders.map((header, index) => (
                  <th
                    className="border-r-2 border-b-2 border-gray-500"
                    key={index}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unis.map((uni) => (
                <tr key={uni.id}>
                  <td className="w-[5%] border-r-2 border-gray-500 p-1 text-center">
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
                  <td className="w-[40%] border-r-2 border-gray-500 p-1 text-center">
                    {uni.name}
                  </td>
                  <td className="w-[20%] border-r-2 border-gray-500 p-1 text-center">
                    {uni.city}
                  </td>
                  <td className="w-[15%] border-r-2 border-gray-500 p-1 text-center">
                    {uni.state}
                  </td>
                  <td className="w-[15%] border-r-2 border-gray-500 p-1 text-center">
                    {uni.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        {selectedUni?.coaches && selectedUni?.coaches.length > 0 && (
          <table className="table-fixed border-2 border-gray-500">
            <thead>
              <tr>
                {coachesHeaders.map((header, index) => (
                  <th
                    className="border-r-2 border-b-2 border-gray-500"
                    key={index}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getCoachesWithEmail(selectedUni?.coaches).map(
                (coach: coachType) => {
                  coach.email;
                  return (
                    <tr key={coach.id}>
                      <td className="w-[5%] border-r-2 border-gray-500 p-1">
                        <button
                          type="button"
                          className="m-1 rounded-lg bg-blue-600 px-2 py-1.5 text-sm font-medium text-white
                      hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 "
                          onClick={() => {
                            if (savedCoaches.length >= 30) return;
                            setSavedCoaches((prev) => {
                              if (
                                prev.map((coach) => coach.id).includes(coach.id)
                              )
                                return prev;
                              if (!validateEmail(coach.email)) {
                                alert(
                                  `${coach.name} has an invalid email: ${coach.email}`
                                );
                                return prev;
                              }
                              const newSavedCoaches = [...prev, coach];
                              return newSavedCoaches;
                            });
                          }}
                          disabled={savedCoaches.length >= 30}
                        >
                          Add
                        </button>
                      </td>
                      <td className="w-[25%] border-r-2 border-gray-500 p-1 text-center">
                        {coach.name}
                      </td>
                      <td className="w-[25%] border-r-2 border-gray-500 p-1 text-center">
                        {coach.email}
                      </td>
                      <td className="border-r-2 border-gray-500 p-1 text-center">
                        {coach.contactNumber}
                      </td>
                      <td className=" border-r-2 border-gray-500 p-1 text-center">
                        {coach.category}
                      </td>
                      <td className="border-r-2 border-gray-500 p-1 text-center">
                        {coach.level}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </div>
      <div>
        Send to:{" "}
        {savedCoaches && savedCoaches.length > 0 ? (
          <span>
            {savedCoaches
              .map((savedCoach) => savedCoach.email)
              .map((coachEmail, i, self) => {
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
    </div>
  );
}
