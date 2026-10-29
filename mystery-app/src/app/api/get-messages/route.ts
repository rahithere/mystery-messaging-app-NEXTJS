import UserModel from "@/app/model/user";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 400 },
    );
  }

  //string will give issue while using aggregation pipeline
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { id: userId } },
      //unwind the message array
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      //grouping the document
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 400 },
      );
    }

    return Response.json(
      { success: true, messages: user[0].messages },
      { status: 200 },
    );
  } catch (error) {}
}
