// pages/api/download/[transferId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { S3 } from "aws-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { transferId } = req.query;

  if (typeof transferId !== "string") {
    res.status(400).json({ message: "Invalid transfer ID" });
    return;
  }

  const s3 = new S3();
  const bucketName = "whizfile-com-transfers";
  const key = `${transferId}.zip`;

  try {
    const s3Response = s3.getObject({ Bucket: bucketName, Key: key });
    const responseBody = await s3Response.promise();

    if (responseBody.Body) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${transferId}.zip"`
      );

      const s3ReadStream = s3Response.createReadStream();
      s3ReadStream.pipe(res);
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching file from S3" });
  }
}
