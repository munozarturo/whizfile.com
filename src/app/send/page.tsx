"use client";

import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import * as React from "react";
import { useState } from "react";
import DropZone from "@/components/ui/dropzone";

export default function Send() {
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <main className="w-full h-full flex flex-row justify-center items-center">
      <Card className="w-3/5 h-3/4 flex flex-row">
        <form onSubmit={onSubmit} className="w-full h-full flex flex-row">
          <div className="w-1/2 h-full flex flex-col">
            <CardHeader className="h-fit w-full">
              <CardTitle as="h1" className="text-primary text-center">
                send
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full w-full flex flex-col space-y-2">
              <div className="flex flex-col">
                <input
                  className="text-primary text-xl font-semibold outline-none"
                  type="text"
                  name="title"
                  placeholder="your title"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <textarea
                className="h-full text-primary outline-none"
                name="message"
                placeholder="your message"
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <input
                type="submit"
                value="get a link"
                className="h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
              />
            </CardContent>
          </div>
          <div className="w-1/2 h-full flex flex-row items-center justify-center py-6 pr-6">
            <DropZone className="w-full h-full " />
          </div>
        </form>
      </Card>
    </main>
  );
}
