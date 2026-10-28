import { success, z } from "zod";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/user";
import { usernameValidation } from "@/schemas/signupSchema";

const UsernameQuerySchema = z.object({
  //username must fulfil usernamevalidation schema
  username: usernameValidation,
});

export async function GET(request: Request) {
  //check if the http method is the one we need only
  //old nextjs
  // if(request.method !== 'GET'){
  //     return Response.json({success:false,message:"Invalid http method"},{status:405})
  // }

  await dbConnect();

  // urlExample = localhost:3000/api/cuu?username=rahit
  try {
    //extract username from query
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    //validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "invalid query parameters",
        },
        { status: 400 },
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        { success: false, message: "username is already taken" },
        { status: 400 },
      );
    }

    return Response.json(
      { success: true, message: "username is unique" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      { success: false, message: "Error Checking username" },
      { status: 500 },
    );
  }
}
