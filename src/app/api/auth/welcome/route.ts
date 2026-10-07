import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendWelcomeActivation } from "@/lib/email/service";

const welcomeSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().optional(),
  userId: z.string().optional(),
  activationUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = welcomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, fullName, userId, activationUrl } = parsed.data;

    const emailResult = await sendWelcomeActivation({
      email,
      fullName,
      userId,
      activationUrl,
    });

    return NextResponse.json({
      success: emailResult.success,
      messageId: emailResult.messageId,
      simulated: emailResult.simulated,
      error: emailResult.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("[API auth/welcome] Error dispatching welcome email:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
