import React from 'react';

export default function Loading() {
    return (
        <div className="products-screen p-4 flex flex-col min-h-screen">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-6 bg-[var(--bg-card)] animate-pulse rounded"></div>
                    <div className="w-48 h-8 bg-[var(--bg-card)] animate-pulse rounded"></div>
                </div>
            </header>

            <div className="modal-body p-0 flex-1">
                <div className="product-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="product-list-item" style={{ display: 'flex', gap: '16px', opacity: 0.7 }}>
                            <div className="w-[100px] h-[100px] bg-[var(--bg-card)] rounded-lg animate-pulse flex-shrink-0"></div>
                            <div className="flex-1 space-y-3 py-2">
                                <div className="h-5 bg-[var(--bg-card)] animate-pulse rounded w-3/4"></div>
                                <div className="h-4 bg-[var(--bg-card)] animate-pulse rounded w-1/2"></div>
                                <div className="h-6 bg-[var(--bg-card)] animate-pulse rounded w-1/3 mt-4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
