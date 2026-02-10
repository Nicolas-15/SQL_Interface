"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  (await cookies()).set({
    name: "auth_token",
    value: "",
    path: "/",
    maxAge: 0,
  });
}
