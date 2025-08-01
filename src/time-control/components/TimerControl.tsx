import React from 'react';
import { ClockIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { useTimerCounter } from '@/time-control/hooks/useTimerCounter';

interface TimerControlProps {
  isActive: boolean;
  startTime: string | null;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const TimerControl: React.FC<TimerControlProps> = ({
  isActive,
  startTime,
  onStart,
  onPause,
  onStop,
  isLoading = false,
  disabled = false
}) => {
  const { formattedTime } = useTimerCounter(startTime, isActive);

  return (
    <div className="flex items-center space-x-2">
      {/* Contador visual */}
      {isActive && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-mono text-blue-700 dark:text-blue-300">
            {formattedTime}
          </span>
        </div>
      )}

      {/* Botones de control */}
      <div className="flex items-center space-x-1">
        {!isActive ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onStart}
            disabled={disabled || isLoading}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400"
          >
            <PlayIcon className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onPause}
              disabled={disabled || isLoading}
              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400"
            >
              <PauseIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStop}
              disabled={disabled || isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
            >
              <StopIcon className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
