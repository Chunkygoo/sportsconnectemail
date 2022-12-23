import { atom } from "jotai";
import type { coachType } from "../components/Email/GenerateEmail";

export const playerNameAtom = atom("");
export const savedCoachesAtom = atom<coachType[]>([]);
