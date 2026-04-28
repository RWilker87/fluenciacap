export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-center p-4">
      <div className="max-w-sm space-y-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
        <p className="text-gray-500">
          Você não tem permissão para acessar esta página.
        </p>
        <a
          href="/dashboard"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
