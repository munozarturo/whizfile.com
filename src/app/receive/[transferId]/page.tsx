"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Transfer from "@/db/models/transfer";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("BASE_URL environment variable not defined.");
}

function TransferView({ transferId }: { transferId: string }) {
  const [transfer, setTransfer] = useState<Transfer | null>(null); // Assuming the shape of transfer is compatible with null initially

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transfer/${transferId}`);
      const transferData = await res.json();
      setTransfer(transferData.data);
    };

    fetchData();
  }, [transferId]); // Dependency array containing transferId

  const downloadTransfer = async (transferId: string) => {
    try {
      console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${transfer?.fileKey}`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${transfer?.fileKey}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `whizfile-transfer-${transferId}.zip`); // Replace 'file.ext' with the filename
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }

    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };

  // f

  if (!transfer) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{transfer.title}</h1>
      <p>{transfer.message}</p>
      <p>{transfer.createdAt}</p>
      <button onClick={() => downloadTransfer(transferId)}>Download</button>
    </div>
  );
}

export default function ReceiveTransferId(context: {
  params: { transferId: string };
}) {
  return (
    <main className="w-full h-full flex flex-row items-center justify-center">
      <Card className="w-3/5 h-3/4 flex flex-col">
        <CardHeader className="h-fit w-full">
          <CardTitle as="h1" className="text-primary text-4xl text-center">
            receive a transfer
          </CardTitle>
        </CardHeader>
        <Suspense fallback={"loading..."}>
          <TransferView transferId={context.params.transferId} />
        </Suspense>
      </Card>
    </main>
  );
}
