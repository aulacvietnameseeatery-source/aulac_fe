import React from 'react';

export const Atmosphere = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Blurred Background Layer 1 */}
            {/* We assume layer1.jpg is the blurred room background provided by user */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{ backgroundImage: 'url(/images/menu-listing/menu-grid/layer1.png)' }}
            ></div>

            {/* Dark Overlay for better contrast */}
            <div className="absolute inset-0 bg-[#0f172a]/70"></div>

            {/* Floating Particles (Optional, can add later) */}
        </div>
    );
};
