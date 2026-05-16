import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { message: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login realizado com sucesso.",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
