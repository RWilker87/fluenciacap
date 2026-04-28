import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <main className="flex max-w-2xl flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Lexfluência
          </h1>
          <p className="text-xl text-gray-600 max-w-xl">
            Plataforma inteligente para avaliação automática de fluência leitora nas escolas municipais.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Cadastrar Escola</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
