import { TRPCError } from "@trpc/server";
import { SES } from "aws-sdk";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { publicProcedure, router } from "../trpc";

const sesConfig = {
  apiVersion: "latest",
  accessKeyId: env.AWS_ACCESS_KEY_ID_,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY_,
  region: env.AWS_REGION_,
  signatureVersion: "v4",
};

export const emailSchema = z.object({
  playerName: z.string(),
  coaches: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
      contactNumber: z.string().nullable(),
      category: z.string(),
      level: z.string(),
      university: z.object({
        id: z.string(),
        name: z.string(),
        city: z.string(),
        state: z.string(),
        category: z.string(),
      }),
    })
  ),
  emailTemplate: z.string(),
});

export const emailRouter = router({
  sendEmail: publicProcedure.input(emailSchema).mutation(async ({ input }) => {
    const ses = new SES(sesConfig);
    const sendConfirmationEmail = (subject: string, message: string) => {
      ses
        .sendEmail({
          Source: env.MAIL_FROM,
          Destination: {
            ToAddresses: ["sportsconnecthq@gmail.com"],
          },
          Message: {
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: message,
              },
              Text: {
                Charset: "UTF-8",
                Data: message,
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: subject,
            },
          },
        })
        .promise();
    };

    const { playerName, coaches, emailTemplate } = input;
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      if (!coach) return;
      const BODY_HTML = emailTemplate
        .replace("PLAYER_NAME", playerName)
        .replace("COACH_NAME", coach?.name || "coach")
        .replace("UNIVERSITY_NAME", coach?.university.name || "your university")
        .split("\n")
        .join("<br />");
      const BODY_TEXT = emailTemplate
        .replace("PLAYER_NAME", playerName)
        .replace("COACH_NAME", coach?.name || "coach")
        .replace("UNIVERSITY_NAME", coach?.university.name || "your university")
        .split("\n")
        .join("<br />");
      const SUBJECT = `Tennis Recruit for ${playerName}`;
      const params = {
        Source: env.MAIL_FROM,
        Destination: {
          // ToAddresses: [coach.email]
          ToAddresses: ["sportsconnecthq@gmail.com", "calvintai0402@gmail.com"],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: BODY_HTML,
            },
            Text: {
              Charset: "UTF-8",
              Data: BODY_TEXT,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: SUBJECT,
          },
        },
      };
      try {
        ses
          .sendEmail(params)
          .promise()
          .then((data) => {
            if (data.MessageId) {
              sendConfirmationEmail(
                `Email sent to: ${coach.email}`,
                `This is a confirmation that your email has been sent to ${coach.email} (${coach.name})`
              );
            }
          })
          .catch((e) => {
            sendConfirmationEmail(
              `ERROR: email NOT sent to: ${coach.email}`,
              `This is a confirmation that your email has failed to be sent to ${coach.email} (${coach.name})`
            );
            throw new Error(e);
          });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }
  }),
});
