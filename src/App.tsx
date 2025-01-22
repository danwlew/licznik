import React, { useState, useEffect, useRef } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import YouTube from 'react-youtube';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState<string>(''); // Godzina zakończenia (HH:mm)
  const [customMinutes, setCustomMinutes] = useState<string>(''); // Niestandardowy czas w minutach
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [showFireworks, setShowFireworks] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://youtu.be/dQw4w9WgXcQ'); // Domyślny URL do YouTube
  const [useDefaultSound, setUseDefaultSound] = useState<boolean>(true); // Flaga dla domyślnego dźwięku
  const [showYoutubeVideo, setShowYoutubeVideo] = useState(false); // Flaga do pokazywania wideo
  const [appName, setAppName] = useState<string>('Cyberpunk Timer'); // Nazwa aplikacji
  const [isEditingName, setIsEditingName] = useState<boolean>(true); // Flaga do edycji nazwy
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const confettiInstance = useRef<any>(null);

  // Uruchamianie fajerwerków
  const startFireworks = () => {
    if (confettiInstance.current) {
      const duration = 5; // czas trwania fajerwerków w sekundach
      const interval = 300; // co ile ms uruchamiamy efekt
      const animationEnd = Date.now() + duration * 1000;

      const fire = () => {
        confettiInstance.current({
          particleCount: 5,
          startVelocity: 30,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#22d3ee', '#ec4899', '#8b5cf6'],
        });

        if (Date.now() < animationEnd) {
          setTimeout(fire, interval);
        }
      };

      fire();
    }
  };

  // Odtwarzanie alarmu
  const playAlarm = () => {
    if (useDefaultSound) {
      if (audioElement.current) {
        audioElement.current
          .play()
          .catch((err) => console.warn('Autoplay blocked or error in playing sound:', err));
      }
    } else {
      setShowYoutubeVideo(true);
    }
  };

  // Zakończenie odliczania
  const handleTimerEnd = () => {
    setIsRunning(false);
    setShowFireworks(true);
    playAlarm();
  };

  // Obliczanie pozostałego czasu
  const calculateTimeLeft = (end: string) => {
    const [endHours, endMinutes] = end.split(':').map(Number);
    const now = new Date();
    const endTime = new Date();

    endTime.setHours(endHours, endMinutes, 0, 0);

    if (endTime < now) {
      endTime.setDate(endTime.getDate() + 1); // Jeśli czas zakończenia jest w przeszłości, ustaw na następny dzień
    }

    const diff = endTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { minutes, seconds };
  };

  // Obsługa odliczania
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const remainingTime = endTime
          ? calculateTimeLeft(endTime)
          : { minutes: timeLeft.minutes, seconds: timeLeft.seconds - 1 };

        if (remainingTime.minutes <= 0 && remainingTime.seconds <= 0) {
          handleTimerEnd();
        } else {
          if (remainingTime.seconds < 0) {
            remainingTime.minutes -= 1;
            remainingTime.seconds = 59;
          }
          setTimeLeft(remainingTime);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, endTime, timeLeft]);

  // Inicjalizacja domyślnego dźwięku
  useEffect(() => {
    audioElement.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => {
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (showFireworks) {
      startFireworks();
    }
  }, [showFireworks]);

  const startTimer = () => {
    if (endTime) {
      setTimeLeft(calculateTimeLeft(endTime));
    } else if (customMinutes) {
      const mins = parseInt(customMinutes, 10);
      if (!isNaN(mins) && mins > 0) {
        setTimeLeft({ minutes: mins, seconds: 0 });
      }
    }
    setIsRunning(true);
    setShowFireworks(false);
    setShowYoutubeVideo(false);
    setIsEditingName(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setEndTime('');
    setCustomMinutes('');
    setTimeLeft({ minutes: 0, seconds: 0 });
    setShowFireworks(false);
    setShowYoutubeVideo(false);
    setIsEditingName(true);
  };

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {isEditingName && (
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Enter app name"
            className="w-full max-w-md bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500 mb-4 text-center text-xl"
          />
        )}
        <h1 className="text-4xl font-bold mb-8 animate-pulse bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          {appName}
        </h1>

        {!isRunning && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Set end time (HH:mm)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setCustomMinutes('');
                }}
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Or set duration (minutes)</label>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value);
                  setEndTime('');
                }}
                placeholder="Enter minutes"
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Use default sound or YouTube</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useDefaultSound}
                  onChange={(e) => setUseDefaultSound(e.target.checked)}
                  className="w-4 h-4 text-cyan-400 focus:ring-cyan-500 rounded"
                />
                <span>{useDefaultSound ? 'Default Sound' : 'YouTube Video'}</span>
              </div>
            </div>
            {!useDefaultSound && (
              <div>
                <label className="block text-sm mb-1">YouTube Video URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Enter YouTube video URL"
                  className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
            <button
              onClick={startTimer}
              disabled={!endTime && !customMinutes}
              className="bg-cyan-400 text-black px-6 py-2 rounded-lg hover:bg-cyan-300 disabled:opacity-50"
            >
              Start Timer
            </button>
          </div>
        )}

        {isRunning && (
          <div className="text-6xl font-mono mt-4">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        )}

        {(isRunning || showFireworks) && (
          <button
            onClick={resetTimer}
            className="bg-pink-500 text-black px-6 py-2 rounded-lg hover:bg-pink-400 mt-8"
          >
            Reset
          </button>
        )}

        {showYoutubeVideo && (
          <div className="mt-8">
            <YouTube
              videoId={getYoutubeVideoId(youtubeUrl)}
              opts={{
                height: '360',
                width: '640',
                playerVars: {
                  autoplay: 1,
                },
              }}
            />
          </div>
        )}
      </div>

      <ReactCanvasConfetti
        refConfetti={(instance) => (confettiInstance.current = instance)}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

export default App;
