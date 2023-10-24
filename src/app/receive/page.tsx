"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

const transferIdPattern = /^[A-Za-z0-9]{6}$/;
const fullURLPattern = /^(https?:\/\/)?whizfile\.com\/receive\/[A-Za-z0-9]{6}$/;

const TransferIdSchema = z
  .string()
  .refine(
    (value) => transferIdPattern.test(value) || fullURLPattern.test(value),
    {
      message:
        "Input must be 6 characters (letters & numbers) or a valid URL followed by 6 characters.",
    }
  );

export default function Receive() {
  const { push } = useRouter();
  const [transferId, setTransferId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const redirectToReceive = (transferId: string) => {
    push(`/receive/${transferId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransferId(value);

    try {
      if (value.length != 0) TransferIdSchema.parse(value);
      setError(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message.toLowerCase());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setQueryError(null);

    if (!transferId) {
      return;
    }

    try {
      // Validate input using Zod
      TransferIdSchema.parse(transferId);

      // Fetch API
      const response = await fetch(`/api/transfer/${transferId}`);

      if (response.status === 200) {
        // Redirect
        redirectToReceive(transferId);
      } else if (response.status === 404) {
        setQueryError("a transfer with that transfer ID does not exist.");
      } else if (response.status === 410) {
        setQueryError("this transfer has expired.");
      } else {
        // Handle other unexpected statuses
        setQueryError("an unexpected error occurred. Please try again.");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Input validation error
        setQueryError(err.errors[0].message);
      } else {
        // Other unexpected errors (e.g., network error)
        setQueryError("an unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <main className="w-full h-full flex flex-row justify-center items-center">
      <Card className="w-3/5 h-3/4 flex flex-col">
        <CardHeader className="h-fit w-full">
          <CardTitle as="h1" className="text-primary text-4xl text-center">
            receive
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col w-full h-full gap-4">
            <div className="flex flex-col w-full h-full gap-1">
              <div className="relative border-4 border-primary rounded-2xl w-full">
                <input
                  type="text"
                  className="text-primary italic text-4xl font-bold outline-none w-full p-2 bg-transparent"
                  name="transferId"
                  onChange={handleChange}
                  spellCheck="false"
                />
                <span className="absolute top-2 left-2 text-gray-400 italic text-4xl font-bold pointer-events-none">
                  {!transferId && "https://whizfile.com/receive/"}
                  <span className="text-primary">
                    {!transferId && "xxxxxx"}
                  </span>
                </span>
              </div>
              {error && (
                <div className="text-primary text-md italic">{error}</div>
              )}
            </div>

            <input
              type="submit"
              value="search"
              className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
            />
          </CardContent>
          {queryError && (
            <div className="text-primary text-lg italic w-full text-center font-bold">
              {queryError}
            </div>
          )}
        </form>
      </Card>
    </main>
  );
}
