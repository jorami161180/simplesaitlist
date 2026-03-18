/**
 * Utility functions for SimpleWaitlist
 */

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}

/**
 * Format a date to a readable Spanish string
 */
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format a date with time
 */
export function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get the public URL for a waitlist
 */
export function getPublicUrl(slug) {
    return `${window.location.origin}/w/${slug}`;
}

/**
 * Process image for upload: resize to 256x256, convert to WebP
 */
export function processImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = 256;
            canvas.height = 256;

            // Calculate crop to make it square
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;

            ctx.drawImage(img, x, y, size, size, 0, 0, 256, 256);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                },
                'image/webp',
                0.85
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Curated accent colors
 */
export const ACCENT_COLORS = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Violeta', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Ámbar', value: '#f59e0b' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Turquesa', value: '#14b8a6' },
    { name: 'Cian', value: '#06b6d4' },
    { name: 'Blanco', value: '#ffffff' },
];

/**
 * Download data as CSV file
 */
export function downloadCSV(data, filename) {
    const csvContent = 'data:text/csv;charset=utf-8,'
        + 'Email,Fecha de inscripción\n'
        + data.map(row => `${row.email},${formatDateTime(row.createdAt)}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download a text blob as file
 */
export function downloadTextFile(content, filename, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
