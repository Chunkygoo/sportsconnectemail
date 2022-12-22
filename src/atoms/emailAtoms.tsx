import { atom } from "jotai";
import type { coachType } from "../components/Email/GenerateEmail";

export const playerNameAtom = atom("");
export const savedCoachEmailsAtom = atom<string[]>([]);
export const savedCoachNamesAtom = atom<string[]>([]);
export const savedCoachesAtom = atom<coachType[]>([]);

export const generateClickedAtom = atom(false);
