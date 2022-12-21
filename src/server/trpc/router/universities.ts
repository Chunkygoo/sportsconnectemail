import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const searchUniSchema = z.object({
  search: z.string(),
});

type searchUniType = z.infer<typeof searchUniSchema>;

const conditionalQuery = (
  input: searchUniType
): Prisma.UniversityFindManyArgs => {
  const nonConditionalsForQuery = {
    take: 5,
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      category: true,
    },
  };
  if (input.search !== "") {
    return {
      ...nonConditionalsForQuery,
      where: {
        OR: [
          {
            name: {
              contains: input.search,
            },
          },
          {
            city: {
              contains: input.search,
            },
          },
          {
            state: {
              contains: input.search,
            },
          },
          {
            conference: {
              contains: input.search,
            },
          },
          {
            division: {
              contains: input.search,
            },
          },
          {
            category: {
              contains: input.search,
            },
          },
          {
            region: {
              contains: input.search,
            },
          },
        ],
      },
    };
  }
  return {
    ...nonConditionalsForQuery,
  };
};

export const universityRouter = router({
  getUniversities: publicProcedure
    .input(searchUniSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.university.findMany(conditionalQuery(input));
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
