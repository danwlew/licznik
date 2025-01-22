import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { Timer, Volume2, Clock, Bell } from 'lucide-react';

interface CountdownState {
  minutes: number;
  seconds: number;
}

function App() {
  const [title, setTitle] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<CountdownState>({ minutes: 0, seconds: 0 });
  const [showFireworks, setShowFireworks] = useState<boolean>(false);
  const [showAlarm, setShowAlarm] = useState<boolean>(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [useDefaultAlarm, setUseDefaultAlarm] = useState<boolean>(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    setAudioElement(audio);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && (timeLeft.minutes > 0 || timeLeft.seconds > 0)) {
      interval = setInterval(() => {
        if (timeLeft.seconds === 0) {
          if (timeLeft.minutes === 0) {
            setIsRunning(false);
            setShowFireworks(true);
            setShowAlarm(true);
            if (useDefaultAlarm && audioElement) {
              audioElement.play().catch((err) => {
                console.warn('Autoplay blocked. User interaction required.', err);
              });
            }
          } else {
            setTimeLeft({
              minutes: timeLeft.minutes - 1,
              seconds: 59,
            });
          }
        } else {
          setTimeLeft({
            ...timeLeft,
            seconds: timeLeft.seconds - 1,
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, useDefaultAlarm, audioElement]);

  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date();
    const endDate = new Date();

    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    startDate.setHours(startHours, startMinutes, 0);
    endDate.setHours(endHours, endMinutes, 0);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  const startTimer = () => {
    let mins = 0;

    if (startTime && endTime) {
      mins = calculateDuration(startTime, endTime);
    } else if (duration) {
      mins = parseInt(duration);
    }

    if (mins > 0) {
      setTimeLeft({ minutes: mins, seconds: 0 });
      setIsRunning(true);
      setShowFireworks(false);
      setShowAlarm(false);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft({ minutes: 0, seconds: 0 });
    setShowFireworks(false);
    setShowAlarm(false);
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col items-center justify-center p-4">
      {!isRunning && (
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8 animate-pulse bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Cyberpunk Timer
            </h1>
            
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter countdown title"
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
              />
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Minutes</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setStartTime('');
                        setEndTime('');
                      }}
                      placeholder="Minutes"
                      className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-block border-b-2 border-cyan-400 pb-2 mb-4">
                    <span className="text-sm">OR</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setDuration('');
                      }}
                      className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        setDuration('');
                      }}
                      className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Custom YouTube Alarm</label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="YouTube URL (optional)"
                      className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useDefaultAlarm}
                        onChange={(e) => setUseDefaultAlarm(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${useDefaultAlarm ? 'bg-cyan-400' : 'bg-gray-600'} relative`}>
                        <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${useDefaultAlarm ? 'right-1' : 'left-1'}`} />
                      </div>
                      <Bell size={16} className="ml-2" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl mb-4">{title || 'Countdown'}</h2>

            <div className="flex justify-center gap-4">
              <button
                onClick={startTimer}
                disabled={isRunning || (!duration && (!startTime || !endTime))}
                className="flex items-center gap-2 bg-cyan-400 text-black px-6 py-2 rounded-lg hover:bg-cyan-300 disabled:opacity-50"
              >
                <Timer size={20} />
                Start
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 bg-pink-500 text-black px-6 py-2 rounded-lg hover:bg-pink-400"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">{title || 'Countdown'}</h2>
          <div className="text-6xl font-bold mb-8 font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 bg-pink-500 text-black px-6 py-2 rounded-lg hover:bg-pink-400"
          >
            Reset
          </button>
        </div>
      )}

      {showAlarm && youtubeUrl && !useDefaultAlarm && (
        <div className="fixed bottom-4 right-4">
          <YouTube
            videoId={getYoutubeVideoId(youtubeUrl)}
            opts={{
              height: '200',
              width: '300',
              playerVars: {
                autoplay: 1,
              },
            }}
          />
        </div>
      )}

      <ReactCanvasConfetti
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
        fire={showFireworks}
        colors={['#22d3ee', '#ec4899', '#8b5cf6']}
      />
    </div>
  );
}

export default App;
