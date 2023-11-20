"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import React, { useState, useEffect, Suspense } from "react";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL environment variable not defined.");
}

interface Transfer {
  title: string;
  message: string;
  createdAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function Transfer({ transferId }: { readonly transferId: string }) {
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchTransfer() {
  //     try {
  //       const res = await fetch(`${baseUrl}/api/transfer/${transferId}`);
  //       const data = await res.json();
  //       setTransfer(data);
  //     } catch (err) {
  //       if (err instanceof Error) {
  //         setError(err.message);
  //       } else {
  //         setError("An unknown error occurred");
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchTransfer();
  // }, [transferId]);

  setTransfer({
    title: "title",
    message: "message",
    createdAt: "1700426687182",
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{transfer?.title}</h1>
      <p>{transfer?.message}</p>
      <p>{new Date(transfer?.createdAt || "").toLocaleString()}</p>
    </div>
  );
}

// async function downloadFile(transferId: string) {
//   try {
//     const response = await fetch(`/api/download/${transferId}`);

//     if (!response.ok) {
//       throw new Error("Error fetching file");
//     }

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "downloadedfile.zip"; // or use the file name from the response
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Download error:", error.message);
//     }

//     console.error(error);
//   }
// }

async function downloadFile(transferId: string) {
  try {
    // Create an empty Blob for a .txt file
    const content = ""; // You can put any test content here
    const blob = new Blob([content], { type: "text/plain" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testfile.txt"; // Name the file as you wish
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Download error:", error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}

export default function ReceiveTransferId(context: {
  readonly params: { readonly transferId: string };
}) {
  return (
    <main className="w-full h-full flex flex-row items-center justify-center">
      <Card className="w-3/5 h-3/4 flex flex-col">
        <CardHeader className="h-fit w-full">
          <CardTitle as="h1" className="text-primary text-4xl text-center">
            receive a transfer
          </CardTitle>
        </CardHeader>
        {/* <Transfer transferId={context.params.transferId} /> */}
        <button onClick={() => downloadFile(context.params.transferId)}>
          Download File
        </button>
      </Card>
    </main>
  );
}
