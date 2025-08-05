import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    
    // Process interests from comma-separated string to JSON string
    const interests = body.interests 
      ? JSON.stringify(body.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i))
      : null;

    const updatedUser = await db.user.update({
      where: {
        id: session.userId,
      },
      data: {
        title: body.title || null,
        company: body.company || null,
        industry: body.industry || null,
        experience: body.experience || null,
        salary: body.salary || null,
        education: body.education || null,
        location: body.location || null,
        bio: body.bio || null,
        gender: body.gender || null,
        age: body.age || null,
        lookingFor: body.lookingFor || null,
        ageRange: body.ageRange || null,
        religion: body.religion || null,
        interests: interests,
        lifestyle: body.lifestyle || null,
        relationshipGoals: body.relationshipGoals || null,
        linkedinUrl: body.linkedinUrl || null,
        twitterUrl: body.twitterUrl || null,
        isProfileComplete: true, // Mark profile as complete when they save it
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        title: true,
        company: true,
        industry: true,
        experience: true,
        salary: true,
        education: true,
        location: true,
        bio: true,
        gender: true,
        age: true,
        lookingFor: true,
        ageRange: true,
        religion: true,
        interests: true,
        lifestyle: true,
        relationshipGoals: true,
        linkedinUrl: true,
        twitterUrl: true,
        isProfileComplete: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Parse interests from JSON string to array
    const userData = {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
    };

    return Response.json(userData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}