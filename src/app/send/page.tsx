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
import JSZip from "jszip";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("`NEXT_PUBLIC_BASE_URL` not defined.")
}

async function createZip(files: File[]): Promise<Blob> {
  const zip = new JSZip();

  // Add each file to the zip
  files.forEach((file) => {
    zip.file(file.name, file);
  });

  // Generate the zip file
  const content: Blob = await zip.generateAsync({ type: "blob" });
  return content;
}

export default function Send() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [sentTransferId, setSentTransferId] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file: Blob = await createZip(files);

    try {
      const transferResp = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transfer`, {
        title: title,
        message: message,
      })

      const data = transferResp.data.data as unknown as {oneTimeCode: string, transferId: string};

      const formData = new FormData();
      formData.set("file", file);
      formData.set("oneTimeCode", data.oneTimeCode);
      formData.set("transferId", data.transferId);

      const fileResp = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file`, formData);

      setSentTransferId(data.transferId);
    } catch {
      setTransferError(true);
    }
  };

  return (
    <main className="w-full h-full flex flex-row justify-center items-center">
      {sentTransferId == null && (
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
                  className="cursor-pointer h-fit w-full bg-primary rounded-xl p-2 text-secondary italic font-extrabold text-xl"
                />
              </CardContent>
            </div>
            <div className="w-1/2 h-full flex flex-row items-center justify-center py-6 pr-6">
              <DropZone
                className="w-full h-full"
                files={files}
                setFiles={setFiles}
              />
            </div>
          </form>
        </Card>
      )}
      {sentTransferId != null && (
        <Card className="w-3/5 h-3/4 flex flex-row">{sentTransferId}</Card>
      )}
      {transferError && (
        <div className="error-message">
          There was an error processing your transfer.
        </div>
      )}
    </main>
  );
}
