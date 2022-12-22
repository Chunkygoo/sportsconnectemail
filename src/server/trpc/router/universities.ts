import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const searchUniSchema = z.object({
  search: z.string(),
});

export const universityRouter = router({
  getUniversities: publicProcedure
    .input(searchUniSchema)
    .query(async ({ ctx, input }) => {
      try {
        if (input.search !== "") {
          return await ctx.prisma.university.findMany({
            take: 5,
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              category: true,
              coaches: {
                include: {
                  university: true,
                },
              },
            },
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
          });
        } else {
          return await ctx.prisma.university.findMany({
            take: 5,
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              category: true,
              coaches: {
                include: {
                  university: true,
                },
              },
            },
          });
        }
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
