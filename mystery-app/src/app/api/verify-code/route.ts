import dbConnect from "@/lib/dbConnect";
import {} from "@/schemas/verifySchema";
import UserModel from "@/app/model/user";

export async function POST(request: Request) {
  await dbConnect;

  try {
    const { username, code } = await request.json();

    // data coming from url it optimizes it
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 400 },
      );
    }

    //check verifycode and expiry
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeNotExpired && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        { success: true, message: "Account verified" },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired please signup again",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error verifying User", error);
    return Response.json(
      { success: false, message: "Error verifying User" },
      { status: 500 },
    );
  }
}
