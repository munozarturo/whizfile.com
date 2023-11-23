"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Transfer from "@/db/models/transfer";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/api/axios-instance";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("BASE_URL environment variable not defined.");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function TransferView({ transferId }: { transferId: string }) {
  const { data, error, refetch, isError, isLoading } = useQuery({
    queryKey: ["transferQuery", transferId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/transfer/${transferId}`)
      return res.data;
    }
  });

  const downloadTransfer = async (data: Transfer) => {
    try {
      console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${data.fileKey}`);
      const response = await axiosInstance.get(`/api/file/${data.fileKey}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `whizfile-transfer-${data.transferId}.zip`); // Replace 'file.ext' with the filename
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }

    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div>
      Transfer View
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
        <CardContent>
          <TransferView transferId={context.params.transferId} />
        </CardContent>
      </Card>
    </main>
  );
}
