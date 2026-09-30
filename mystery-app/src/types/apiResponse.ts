import { Message } from "@/app/model/user";

export interface apiResponse {
  success: boolean;
  message: string;
  isAcceptingMessage?: boolean; //optional
  messages?: Array<Message>;
}
