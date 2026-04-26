"use client";
import { getJwtToken } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export default function useApi() {
  async function getToken(): Promise<string> {
    const token = await getJwtToken();
    if (!token) {
      throw new Error("Not authenticated - no token");
    }
    return token;
  }

  async function request(method: string, path: string, body?: any) {
    const token = await getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "API request failed");
    }

    return res.json();
  }

  return {
    // getTasks: (userId: string) => request("GET", `/api/${userId}/tasks`),
    getTasks: (userId: string) => request("GET", `/api/tasks/${userId}`),
    addTask: (userId: string, data: any) => {
      // Only send title and description - backend auto-generates id and other fields
      const payload = { title: data.title, description: data.description };
      return request("POST", `/api/tasks/${userId}`, payload);
    },
updateTask: (userId: string, taskId: string, data: any) =>
      request("PUT", `/api/tasks/${userId}/${taskId}`, data),
    toggleComplete: (userId: string, taskId: string, completed: boolean) =>
      request("PATCH", `/api/tasks/${userId}/${taskId}/complete`,{
        completed,
      }),
    deleteTask: (userId: string, taskId: string) =>
      request("DELETE", `/api/tasks/${userId}/${taskId}`),
  };
}
