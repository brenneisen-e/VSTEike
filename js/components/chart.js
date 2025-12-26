/**
 * Chart Component
 * Wrapper for Chart.js with consistent styling
 */

// ========================================
// CHART DEFAULTS
// ========================================

const CHART_COLORS = {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    secondary: '#64748B',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    purple: '#7C3AED',

    // Chart palette
    palette: [
        '#2563EB', // Blue
        '#16A34A', // Green
        '#D97706', // Amber
        '#DC2626', // Red
        '#7C3AED', // Purple
        '#0891B2', // Cyan
        '#DB2777', // Pink
        '#4F46E5', // Indigo
    ],

    // Gradient colors
    gradients: {
        blue: ['#2563EB', '#60A5FA'],
        green: ['#16A34A', '#4ADE80'],
        purple: ['#7C3AED', '#A78BFA']
    }
};

const DEFAULT_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: '#0F172A',
            titleFont: {
                family: "'Inter', sans-serif",
                size: 13,
                weight: '600'
            },
            bodyFont: {
                family: "'Inter', sans-serif",
                size: 12
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxPadding: 4
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    family: "'Inter', sans-serif",
                    size: 11
                },
                color: '#64748B'
            }
        },
        y: {
            grid: {
                color: '#E2E8F0',
                drawBorder: false
            },
            ticks: {
                font: {
                    family: "'Inter', sans-serif",
                    size: 11
                },
                color: '#64748B'
            }
        }
    }
};

// ========================================
// CHART FACTORY
// ========================================

/**
 * Create chart instance
 * @param {HTMLCanvasElement|string} canvas - Canvas element or selector
 * @param {string} type - Chart type
 * @param {object} data - Chart data
 * @param {object} options - Chart options
 * @returns {object|null} Chart instance or null
 */
export function create(canvas, type, data, options = {}) {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded. Please include Chart.js before using this component.');
        return null;
    }

    const canvasEl = typeof canvas === 'string'
        ? document.querySelector(canvas)
        : canvas;

    if (!canvasEl) {
        console.error('Canvas element not found');
        return null;
    }

    const ctx = canvasEl.getContext('2d');

    // Merge options with defaults
    const mergedOptions = deepMerge(DEFAULT_OPTIONS, options);

    // Apply color palette to datasets if not set
    if (data.datasets) {
        data.datasets.forEach((dataset, index) => {
            const color = CHART_COLORS.palette[index % CHART_COLORS.palette.length];

            if (!dataset.backgroundColor) {
                if (type === 'line' || type === 'radar') {
                    dataset.backgroundColor = hexToRgba(color, 0.1);
                    dataset.borderColor = color;
                    dataset.borderWidth = 2;
                    dataset.pointBackgroundColor = color;
                    dataset.pointRadius = 4;
                    dataset.pointHoverRadius = 6;
                    dataset.tension = 0.3;
                } else if (type === 'bar') {
                    dataset.backgroundColor = hexToRgba(color, 0.8);
                    dataset.hoverBackgroundColor = color;
                    dataset.borderRadius = 4;
                } else if (type === 'doughnut' || type === 'pie') {
                    if (!data.datasets[0].backgroundColor) {
                        data.datasets[0].backgroundColor = CHART_COLORS.palette.slice(0, data.labels?.length || 5);
                    }
                } else {
                    dataset.backgroundColor = color;
                }
            }
        });
    }

    // Create chart
    const chart = new Chart(ctx, {
        type,
        data,
        options: mergedOptions
    });

    // Wrapper instance with helper methods
    return {
        chart,
        canvas: canvasEl,

        update(newData, animation = true) {
            if (newData.labels) chart.data.labels = newData.labels;
            if (newData.datasets) {
                newData.datasets.forEach((newDs, i) => {
                    if (chart.data.datasets[i]) {
                        Object.assign(chart.data.datasets[i], newDs);
                    }
                });
            }
            chart.update(animation ? undefined : 'none');
        },

        addData(label, data) {
            chart.data.labels.push(label);
            chart.data.datasets.forEach((dataset, i) => {
                dataset.data.push(Array.isArray(data) ? data[i] : data);
            });
            chart.update();
        },

        removeData() {
            chart.data.labels.pop();
            chart.data.datasets.forEach(dataset => dataset.data.pop());
            chart.update();
        },

        setOptions(newOptions) {
            Object.assign(chart.options, newOptions);
            chart.update();
        },

        resize() {
            chart.resize();
        },

        destroy() {
            chart.destroy();
        },

        toBase64() {
            return canvasEl.toDataURL('image/png');
        }
    };
}

// ========================================
// PRESET CHART TYPES
// ========================================

/**
 * Create line chart
 */
export function line(canvas, data, options = {}) {
    return create(canvas, 'line', data, {
        ...options,
        elements: {
            line: {
                tension: 0.3
            }
        }
    });
}

/**
 * Create bar chart
 */
export function bar(canvas, data, options = {}) {
    return create(canvas, 'bar', data, {
        ...options,
        plugins: {
            ...options.plugins,
            legend: {
                display: false,
                ...options.plugins?.legend
            }
        }
    });
}

/**
 * Create horizontal bar chart
 */
export function horizontalBar(canvas, data, options = {}) {
    return create(canvas, 'bar', data, {
        ...options,
        indexAxis: 'y'
    });
}

/**
 * Create doughnut chart
 */
export function doughnut(canvas, data, options = {}) {
    return create(canvas, 'doughnut', data, {
        ...options,
        cutout: '70%',
        plugins: {
            ...options.plugins,
            legend: {
                position: 'right',
                ...options.plugins?.legend
            }
        },
        scales: {} // Remove scales for doughnut
    });
}

/**
 * Create pie chart
 */
export function pie(canvas, data, options = {}) {
    return create(canvas, 'pie', data, {
        ...options,
        plugins: {
            ...options.plugins,
            legend: {
                position: 'right',
                ...options.plugins?.legend
            }
        },
        scales: {} // Remove scales for pie
    });
}

/**
 * Create area chart
 */
export function area(canvas, data, options = {}) {
    // Ensure datasets have fill
    if (data.datasets) {
        data.datasets.forEach(ds => {
            ds.fill = true;
        });
    }

    return create(canvas, 'line', data, {
        ...options,
        elements: {
            line: {
                tension: 0.4
            }
        }
    });
}

/**
 * Create sparkline (mini chart)
 */
export function sparkline(canvas, data, color = CHART_COLORS.primary) {
    const canvasEl = typeof canvas === 'string'
        ? document.querySelector(canvas)
        : canvas;

    if (canvasEl) {
        canvasEl.style.height = '40px';
    }

    return create(canvas, 'line', {
        labels: data.map((_, i) => i),
        datasets: [{
            data,
            borderColor: color,
            backgroundColor: hexToRgba(color, 0.1),
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4
        }]
    }, {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        elements: {
            point: { radius: 0 }
        }
    });
}

// ========================================
// UTILITIES
// ========================================

/**
 * Convert hex to rgba
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
    const output = { ...target };

    for (const key in source) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
            output[key] = deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    }

    return output;
}

/**
 * Create gradient
 */
export function createGradient(ctx, type = 'blue', direction = 'vertical') {
    const colors = CHART_COLORS.gradients[type] || CHART_COLORS.gradients.blue;
    const height = ctx.canvas.height;
    const width = ctx.canvas.width;

    const gradient = direction === 'vertical'
        ? ctx.createLinearGradient(0, 0, 0, height)
        : ctx.createLinearGradient(0, 0, width, 0);

    gradient.addColorStop(0, hexToRgba(colors[0], 0.5));
    gradient.addColorStop(1, hexToRgba(colors[1], 0.1));

    return gradient;
}

// Export colors for external use
export { CHART_COLORS };

// Export default
export default {
    create,
    line,
    bar,
    horizontalBar,
    doughnut,
    pie,
    area,
    sparkline,
    createGradient,
    CHART_COLORS
};
