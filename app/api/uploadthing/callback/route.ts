import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../core";

export const { POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
  },
});
