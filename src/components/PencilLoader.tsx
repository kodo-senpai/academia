import React from 'react';

interface PencilLoaderProps {
  visible: boolean;
  message?: string;
  progress?: number;
}

export const PencilLoader: React.FC<PencilLoaderProps> = ({
  visible,
  message = 'Loading attendance registers & safe bunk matrices...',
  progress = 100,
}) => {
  if (!visible) return null;

  return (
    <div
      id="pencil-loading-screen"
      className="fixed inset-0 z-50 bg-[#F8F5EE] dark:bg-[#0c1017] flex flex-col items-center justify-center p-6 text-center transition-all duration-500"
    >
      <div className="pencil-loader-wrap">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="180px"
          width="180px"
          viewBox="0 0 200 200"
          className="pencil-loader"
        >
          <defs>
            <linearGradient id="pencilStrokeGrad" y2="0" x2="1" y1="0" x1="0">
              <stop stopColor="#E9B50B" offset="0%" />
              <stop stopColor="#E05A47" offset="50%" />
              <stop stopColor="#10B981" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="none" className="pencil__rotate">
            <circle
              strokeDashoffset="439.82"
              strokeDasharray="439.82"
              strokeWidth="2"
              stroke="url(#pencilStrokeGrad)"
              r="70"
              className="pencil__stroke"
            />
            <g transform="translate(100,100)">
              <g className="pencil__body1">
                <g className="pencil__body2">
                  <g className="pencil__body3">
                    <path d="m -17,-70 l 34,0 l 0,8 l -34,0 z" fill="#231F1C" className="dark:fill-[#E9B50B]" />
                    <path d="m -17,-62 l 34,0 l 0,42 l -34,0 z" fill="#E9B50B" />
                    <path d="m -17,-20 l 34,0 l 0,8 l -34,0 z" fill="#E05A47" />
                  </g>
                </g>
              </g>
              <g className="pencil__eraser-skew">
                <g className="pencil__eraser">
                  <rect height="16" width="30" y="-72" x="-15" rx="3" fill="#f87171" />
                  <rect height="4" width="30" y="-58" x="-15" fill="#e2e8f0" />
                </g>
              </g>
              <g className="pencil__point">
                <polygon points="15,-14 -15,-14 0,16" fill="#f3c99f" />
                <polygon points="5,4 -5,4 0,16" fill="#231F1C" />
              </g>
            </g>
          </g>
        </svg>

        <div className="space-y-1 mt-2">
          <h2 className="font-display text-2xl font-black tracking-tight text-beige-900 dark:text-accentGold">
            ACADEMIA BCA AI-DS
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-beige-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <div className="w-48 h-1.5 bg-beige-200 dark:bg-gray-800 rounded-full overflow-hidden mt-3 border border-black/20 dark:border-gray-700">
          <div
            className="h-full bg-accentGold transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
