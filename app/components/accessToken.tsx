import { getSession } from "next-auth/react";
export default async function Component() {
  const session = await getSession();
  const { accessToken } = session || {};
  return <div>Access Token: {accessToken}</div>;
}
