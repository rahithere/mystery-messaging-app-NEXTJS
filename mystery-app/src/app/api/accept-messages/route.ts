import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/user";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  //getServerSession needs auth options otherwise it wont know
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = user._id;

  //from frontend the toggle data to accept/reject
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Message acceptance status updated succesfully",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update user staus to accept user messages");
    return Response.json(
      {
        success: false,
        message: "Failed to update user staus to accept user messages",
      },
      { status: 500 },
    );
  }
}
