// PLACE AT: app/api/user/profile/route.ts
// PURPOSE:   Update logged-in user's profile fields (phone, bio, city, etc.)
// CALLED BY: components/dashboard/ProfileTab.tsx → "Save Profile" button

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function PATCH(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fullName, phone, bio, city, state, country } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone   !== undefined && { phone   }),
      ...(bio     !== undefined && { bio     }),
      ...(city    !== undefined && { city    }),
      ...(state   !== undefined && { state   }),
      ...(country !== undefined && { country }),
    },
    select: { id: true, fullName: true, email: true },
  });

  return NextResponse.json({ success: true, user: updated });
}