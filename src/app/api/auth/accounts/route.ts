import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const accounts = await db.account.findMany({
      where: {
        userId: session.userId,
      },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
      },
    });

    return Response.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}