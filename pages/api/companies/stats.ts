import type { NextApiRequest, NextApiResponse } from "next";
import { getDashboardStats } from "@/lib/data/shipments";
import { DashboardStats } from "@/types/company";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStats>
) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const stats = await getDashboardStats();
  res.status(200).json(stats);
}
