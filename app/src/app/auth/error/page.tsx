/**
 * Página de erro de autenticação OAuth
 */

export default function AuthErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>;
}) {
    return (
        <AuthErrorContent searchParams={searchParams} />
    );
}

async function AuthErrorContent({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>;
}) {
    const params = await searchParams;
    const message = params.message || 'Ocorreu um erro na autenticação';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-950 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Erro de Autenticação
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {decodeURIComponent(message)}
                </p>

                <div className="space-y-3">
                    <a
                        href="/api/auth/login"
                        className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Tentar Novamente
                    </a>

                    <a
                        href="/"
                        className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors"
                    >
                        Voltar ao Início
                    </a>
                </div>
            </div>
        </div>
    );
}
