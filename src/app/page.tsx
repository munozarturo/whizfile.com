"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState<string>("");
  const [transferId, setTransferId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    try {
      const data = new FormData();

      data.set("file", file);
      data.set("title", title);
      data.set("message", message);
      data.set("transferId", transferId);

      const res = await fetch("/api", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-3xl font-bold">Upload Files</h1>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="transferId"
            placeholder="Enter transferId"
            onChange={(e) => setTransferId(e.target.value)}
          />
          <input
            type="text"
            name="title"
            placeholder="Enter title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            name="message"
            placeholder="Enter message"
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <input
            type="file"
            name="file"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <input type="submit" value="upload" />
        </form>
      </div>
    </section>
  );
}
