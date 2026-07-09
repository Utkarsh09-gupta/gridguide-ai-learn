"use server";

import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export async function getSessionCookie(): Promise<string | undefined> {
  try {
    return getCookie("session");
  } catch (e) {
    console.error("Error reading session cookie:", e);
    return undefined;
  }
}

export async function setSessionCookie(token: string) {
  try {
    setCookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (e) {
    console.error("Error setting session cookie:", e);
  }
}

export async function deleteSessionCookie() {
  try {
    deleteCookie("session", { path: "/" });
  } catch (e) {
    console.error("Error deleting session cookie:", e);
  }
}

export async function getAdminClearanceCookie(): Promise<string | undefined> {
  try {
    return getCookie("admin_clearance");
  } catch (e) {
    return undefined;
  }
}

export async function setAdminClearanceCookie(token: string) {
  try {
    setCookie("admin_clearance", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
    });
  } catch (e) {
    console.error("Error setting admin clearance cookie:", e);
  }
}

export async function deleteAdminClearanceCookie() {
  try {
    deleteCookie("admin_clearance", { path: "/" });
  } catch (e) {
    console.error("Error deleting admin clearance cookie:", e);
  }
}
