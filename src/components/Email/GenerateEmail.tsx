import { useAtom } from "jotai";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { playerNameAtom } from "../../atoms/emailAtoms";
import { trpc } from "../../utils/trpc";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type universityType = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
};

const columnHelper = createColumnHelper<universityType>();

export default function GenerateEmail() {
  const [playerName, setPlayerName] = useAtom(playerNameAtom);
  const [searchedUni, setSearchedUni] = useState("");
  const [selectedUniId, setSelectedUniId] = useState("");
  const utils = trpc.useContext();
  const { data: unis } = trpc.university.getUniversities.useQuery(
    {
      search: searchedUni,
    },
    {
      onSuccess(data) {
        setData(() => data);
      },
    }
  );
  const [data, setData] = useState(() => {
    if (unis) return unis;
    return [];
  });

  const columns = [
    columnHelper.accessor("id", {
      cell: (info) => (
        <input
          aria-label="checkbox"
          type="checkbox"
          onChange={() => {
            setSelectedUniId(info.getValue());
          }}
          checked={info.getValue() === selectedUniId}
        ></input>
      ),
      header: () => <span>id</span>,
    }),
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("city", {
      cell: (info) => info.getValue(),
      header: () => <span>City</span>,
    }),
    columnHelper.accessor("state", {
      cell: (info) => info.getValue(),
      header: () => <span>State</span>,
    }),
    columnHelper.accessor("category", {
      cell: (info) => info.getValue(),
      header: () => <span>Categorty</span>,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
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
        Selected University: {selectedUniId !== "" ? selectedUniId : "none"}
        <button
          type="button"
          className="mr-2 mb-2 ml-2 rounded-lg bg-blue-400 px-2 py-1.5 text-sm font-medium
           text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => setSelectedUniId("")}
        >
          Clear
        </button>
      </h2>
      <label>
        Search unis :
        <DebounceInput
          debounceTimeout={2000}
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
        <table className="border-2 border-gray-500">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
