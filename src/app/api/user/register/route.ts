import { register } from "@/actions/user-actions";
import { NextResponse } from "next/server";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);
    if (!result?.success && result.error) {
      return NextResponse.json(
        { data: null, error: result.error.flatten() },
        { status: 400 }
      );
    }
    const payload = await register({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    console.log("register: ", payload);
    return NextResponse.json({ data: payload, error: null }, { status: 201 });
  } catch (error) {
    console.error("Error signing up user:", error);
    return NextResponse.json(
      { data: null, error: (error as Error)?.message || "Failed to Signup " },
      { status: 500 }
    );
  }
}
