import React, { useState, useEffect, useRef } from 'react';

// Funkcja do detekcji urządzeń mobilnych
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Komponent aplikacji
const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState<string>(''); // Godzina zakończenia (HH:mm)
  const [customMinutes, setCustomMinutes] = useState<string>(''); // Niestandardowy czas w minutach
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://youtu.be/dQw4w9WgXcQ'); // Domyślny URL do YouTube
  const [useDefaultSound, setUseDefaultSound] = useState<boolean>(true); // Flaga dla domyślnego dźwięku
  const [showYoutubeVideo, setShowYoutubeVideo] = useState(false); // Flaga do pokazywania wideo
  const [appName, setAppName] = useState<string>('Cyberpunk Timer'); // Nazwa aplikacji
  const [isEditingName, setIsEditingName] = useState<boolean>(true); // Flaga do edycji nazwy
  const [alarmTime, setAlarmTime] = useState<string>(''); // Rzeczywisty czas zakończenia odliczania
  const [isEnglish, setIsEnglish] = useState<boolean>(true); // Flaga do przełączania języka
  const audioElement = useRef<HTMLAudioElement | null>(null);

  // Teksty w zależności od języka
  const texts = {
    appNamePlaceholder: isEnglish ? 'Enter app name' : 'Wpisz nazwę aplikacji',
    setEndTimeLabel: isEnglish ? 'Set end time (HH:mm)' : 'Ustaw czas zakończenia (HH:mm)',
    setDurationLabel: isEnglish ? 'Or set duration (minutes)' : 'Lub ustaw czas trwania (minuty)',
    useDefaultSoundLabel: isEnglish ? 'Use default sound or YouTube' : 'Użyj domyślnego dźwięku lub YouTube',
    defaultSound: isEnglish ? 'Default Sound' : 'Domyślny dźwięk',
    youtubeVideo: isEnglish ? 'YouTube Video' : 'Wideo YouTube',
    youtubeUrlPlaceholder: isEnglish ? 'Enter YouTube video URL' : 'Wpisz URL wideo YouTube',
    startTimer: isEnglish ? 'Start Timer' : 'Rozpocznij odliczanie',
    reset: isEnglish ? 'Reset' : 'Resetuj',
    alarmSetTo: isEnglish ? 'Alarm set to:' : 'Alarm ustawiony na:',
    closeVideo: isEnglish ? 'Close Video' : 'Zamknij wideo',
    noCookies: isEnglish
      ? 'This app does not store cookies or any data on your device.'
      : 'Ta aplikacja nie przechowuje ciasteczek ani żadnych danych na Twoim urządzeniu.',
  };

  // Funkcja do odtwarzania alarmu
  const playAlarm = () => {
    if (useDefaultSound) {
      // Wymagana interakcja użytkownika przed odtworzeniem dźwięku
      if (audioElement.current) {
        audioElement.current.play().catch((err) => console.warn('Error playing sound:', err));
      }
    } else {
      if (isMobileDevice()) {
        // Przekierowanie do aplikacji YouTube na urządzeniach mobilnych
        const videoId = getYoutubeVideoId(youtubeUrl);
        if (videoId) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        }
      } else {
        // Otwarcie wideo w przeglądarce na komputerach
        setShowYoutubeVideo(true);
      }
    }
  };

  // Funkcja do obsługi zakończenia odliczania
  const handleTimerEnd = () => {
    setIsRunning(false);
    playAlarm();
  };

  // Funkcja obliczająca pozostały czas
  const calculateTimeLeft = (end: string) => {
    const [endHours, endMinutes] = end.split(':').map(Number);
    const now = new Date();
    const endTime = new Date();

    endTime.setHours(endHours, endMinutes, 0, 0);

    if (endTime < now) {
      endTime.setDate(endTime.getDate() + 1); // Jeśli czas zakończenia jest w przeszłości, ustaw na następny dzień
    }

    const diff = endTime.getTime() - now.getTime();
    return {
      minutes: Math.floor(diff / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  // Funkcja obliczająca godzinę alarmu dla niestandardowych minut
  const calculateAlarmTime = (durationMinutes: number) => {
    const now = new Date();
    const alarm = new Date(now.getTime() + durationMinutes * 60 * 1000);
    return alarm.toTimeString().slice(0, 5); // Zwraca "HH:mm"
  };

  // Obsługa logiki odliczania
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
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

    return () => clearInterval(interval);
  }, [isRunning, endTime, timeLeft]);

  // Inicjalizacja dźwięku
  useEffect(() => {
    audioElement.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => {
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current.currentTime = 0;
      }
    };
  }, []);

  const startTimer = () => {
    if (endTime) {
      setTimeLeft(calculateTimeLeft(endTime));
      setAlarmTime(endTime);
    } else if (customMinutes) {
      const minutes = parseInt(customMinutes, 10);
      if (minutes > 0) {
        setTimeLeft({ minutes, seconds: 0 });
        setAlarmTime(calculateAlarmTime(minutes));
      }
    }
    setIsRunning(true);
    setIsEditingName(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setEndTime('');
    setCustomMinutes('');
    setTimeLeft({ minutes: 0, seconds: 0 });
    setShowYoutubeVideo(false);
    setAlarmTime('');
    setIsEditingName(true);
  };

  // Funkcja do wyciągania ID wideo z URL YouTube
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
            placeholder={texts.appNamePlaceholder}
            className="w-full max-w-md bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500 mb-4 text-center text-xl"
            style={{ width: '300px', height: '50px' }} // Powiększenie pola tekstowego
          />
        )}
        <h1
          className="text-4xl font-bold mb-8 animate-pulse bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text p-4"
          style={{
            textShadow: '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #8b5cf6',
            animation: 'pulse-neon 1.5s infinite',
          }}
        >
          {appName}
        </h1>

        {!isRunning && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">{texts.setEndTimeLabel}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setCustomMinutes('');
                }}
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                style={{ width: '300px', height: '50px' }} // Powiększenie pola tekstowego
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{texts.setDurationLabel}</label>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value);
                  setEndTime('');
                }}
                placeholder={texts.setDurationLabel}
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                style={{ width: '300px', height: '50px' }} // Powiększenie pola tekstowego
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <label className="block text-sm mb-1">{texts.useDefaultSoundLabel}</label>
              <input
                type="checkbox"
                checked={useDefaultSound}
                onChange={(e) => setUseDefaultSound(e.target.checked)}
                className="w-4 h-4 text-cyan-400 focus:ring-cyan-500 rounded"
              />
            </div>
            {!useDefaultSound && (
              <div>
                <label className="block text-sm mb-1">YouTube Video URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder={texts.youtubeUrlPlaceholder}
                  className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                  style={{ width: '300px', height: '50px' }} // Powiększenie pola tekstowego
                />
              </div>
            )}
            <button
              onClick={startTimer}
              disabled={!endTime && !customMinutes}
              className="bg-cyan-400 text-black px-6 py-2 rounded-lg hover:bg-cyan-300 disabled:opacity-50 transition-all duration-300"
              style={{
                boxShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 20px #22d3ee',
              }}
            >
              {texts.startTimer}
            </button>
          </div>
        )}

        {isRunning && (
          <div className="text-6xl font-mono mt-4">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        )}

        {isRunning && alarmTime && (
          <p className="mt-4 text-lg">
            {texts.alarmSetTo} <span className="font-bold">{alarmTime}</span>
          </p>
        )}

        {showYoutubeVideo && !isMobileDevice() && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center">
            <iframe
              width="640"
              height="360"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1&mute=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button
              onClick={() => setShowYoutubeVideo(false)}
              className="mt-4 bg-pink-500 text-black px-4 py-2 rounded-lg hover:bg-pink-400 transition-all duration-300"
              style={{
                boxShadow: '0 0 5px #ec4899, 0 0 10px #ec4899, 0 0 20px #ec4899',
              }}
            >
              {texts.closeVideo}
            </button>
          </div>
        )}
      </div>

      {/* Przyciski w lewym dolnym rogu */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between">
        <button
          onClick={resetTimer}
          className="bg-pink-500 text-black px-4 py-2 rounded-lg hover:bg-pink-400 transition-all duration-300"
          style={{
            boxShadow: '0 0 5px #ec4899, 0 0 10px #ec4899, 0 0 20px #ec4899',
          }}
        >
          {texts.reset}
        </button>
        <button
          onClick={() => setIsEnglish(!isEnglish)}
          className="bg-purple-500 text-black px-4 py-2 rounded-lg hover:bg-purple-400 transition-all duration-300"
          style={{
            boxShadow: '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 20px #8b5cf6',
          }}
        >
          {isEnglish ? 'PL' : 'ENG'}
        </button>
      </div>

      {/* Tekst o ciasteczkach */}
      <footer className="w-full flex justify-center mt-8 text-sm text-cyan-400">
        <p className="text-center">{texts.noCookies}</p>
      </footer>

      {/* Animacja neonowego pulsowania */}
      <style>
        {`
          @keyframes pulse-neon {
            0% {
              text-shadow: 0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #8b5cf6;
            }
            50% {
              text-shadow: 0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #8b5cf6, 0 0 80px #8b5cf6;
            }
            100% {
              text-shadow: 0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #8b5cf6;
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;