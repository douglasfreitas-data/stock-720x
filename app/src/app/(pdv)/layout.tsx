import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import PDVClientLayout from './PDVClientLayout';

// Força renderização dinâmica — nunca cache estático
export const dynamic = 'force-dynamic';

export default async function PDVLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Verificação SERVER-SIDE de autenticação
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <PDVClientLayout>{children}</PDVClientLayout>;
}
