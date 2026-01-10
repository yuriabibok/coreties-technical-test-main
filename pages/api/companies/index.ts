import type { NextApiRequest, NextApiResponse } from "next";
import { transformShipmentsToCompanies } from "@/lib/data/shipments";
import { Company } from "@/types/company";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Company[]>
) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const companies = await transformShipmentsToCompanies();
  res.status(200).json(companies);
}
