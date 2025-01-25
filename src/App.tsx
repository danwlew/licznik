import React, { useState, useEffect, useRef, useCallback } from 'react';

// Stałe tekstowe w zależności od języka
const TEXTS = {
  en: {
    appNamePlaceholder: 'Enter app name',
    setEndTimeLabel: 'Set end time (HH:mm)',
    setDurationLabel: 'Or set duration (minutes)',
    useDefaultSoundLabel: 'Use default sound or YouTube',
    defaultSound: 'Default Sound',
    youtubeVideo: 'YouTube Video',
    youtubeUrlPlaceholder: 'Enter YouTube video URL',
    startTimer: 'Start Timer',
    reset: 'Reset',
    alarmSetTo: 'Alarm set to:',
    closeVideo: 'Close Video',
    noCookies: 'This app stores some data locally to remember your preferences.',
    advanced: 'Advanced',
    themes: 'Themes',
    history: 'History',
    timerHistory: 'Timer History',
    nameHistory: 'Name History',
  },
  pl: {
    appNamePlaceholder: 'Wpisz nazwę aplikacji',
    setEndTimeLabel: 'Ustaw czas zakończenia (HH:mm)',
    setDurationLabel: 'Lub ustaw czas trwania (minuty)',
    useDefaultSoundLabel: 'Użyj domyślnego dźwięku lub YouTube',
    defaultSound: 'Domyślny dźwięk',
    youtubeVideo: 'Wideo YouTube',
    youtubeUrlPlaceholder: 'Wpisz URL wideo YouTube',
    startTimer: 'Rozpocznij odliczanie',
    reset: 'Resetuj',
    alarmSetTo: 'Alarm ustawiony na:',
    closeVideo: 'Zamknij wideo',
    noCookies: 'Ta aplikacja przechowuje niektóre dane lokalnie, aby zapamiętać Twoje preferencje.',
    advanced: 'Zaawansowane',
    themes: 'Motywy',
    history: 'Historia',
    timerHistory: 'Historia Liczników',
    nameHistory: 'Historia Nazw',
  },
};

// Funkcja do detekcji urządzeń mobilnych
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Funkcja do wyciągania ID wideo z URL YouTube
const getYoutubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
};

// Funkcja do otwierania wideo w aplikacji YouTube na Androidzie
const openYoutubeInApp = (videoId) => {
  const appUrl = `vnd.youtube://${videoId}`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Próbujemy otworzyć wideo w aplikacji
  window.location.href = appUrl;

  // Jeśli aplikacja nie jest zainstalowana, przekierowujemy do przeglądarki
  setTimeout(() => {
    if (!document.hidden) {
      window.location.href = webUrl;
    }
  }, 500); // Czekamy 500 ms na reakcję aplikacji
};

// Komponent przycisku z animacją
const AnimatedButton = React.memo(({ onClick, children, color, shadowColor }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg transition-all duration-300 font-bold text-black`}
      style={{
        backgroundColor: color,
        boxShadow: `0 0 5px ${shadowColor}, 0 0 10px ${shadowColor}, 0 0 20px ${shadowColor}`,
        filter: 'brightness(40%)', // Domyślnie ciemniejszy o 60%
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = 'brightness(100%)'; // Rozjaśnij po najechaniu
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'brightness(40%)'; // Przywróć ciemniejszy stan
      }}
    >
      {children}
    </button>
  );
});

// Główny komponent aplikacji
const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtu.be/dQw4w9WgXcQ');
  const [useDefaultSound, setUseDefaultSound] = useState(true);
  const [showYoutubeVideo, setShowYoutubeVideo] = useState(false);
  const [appName, setAppName] = useState('Synthwave Timer');
  const [isEditingName, setIsEditingName] = useState(true);
  const [alarmTime, setAlarmTime] = useState('');
  const [isEnglish, setIsEnglish] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [youtubeHistory, setYoutubeHistory] = useState([]);
  const [timerHistory, setTimerHistory] = useState([]);
  const [nameHistory, setNameHistory] = useState([]);
  const audioElement = useRef(null);

  const texts = TEXTS[isEnglish ? 'en' : 'pl'];

  // Zapisywanie ustawień w localStorage
  useEffect(() => {
    const savedAppName = localStorage.getItem('appName');
    const savedYoutubeUrl = localStorage.getItem('youtubeUrl');
    const savedUseDefaultSound = localStorage.getItem('useDefaultSound');
    const savedIsEnglish = localStorage.getItem('isEnglish');
    const savedYoutubeHistory = localStorage.getItem('youtubeHistory');
    const savedTimerHistory = localStorage.getItem('timerHistory');
    const savedNameHistory = localStorage.getItem('nameHistory');

    if (savedAppName) setAppName(savedAppName);
    if (savedYoutubeUrl) setYoutubeUrl(savedYoutubeUrl);
    if (savedUseDefaultSound) setUseDefaultSound(savedUseDefaultSound === 'true');
    if (savedIsEnglish) setIsEnglish(savedIsEnglish === 'true');
    if (savedYoutubeHistory) setYoutubeHistory(JSON.parse(savedYoutubeHistory));
    if (savedTimerHistory) setTimerHistory(JSON.parse(savedTimerHistory));
    if (savedNameHistory) setNameHistory(JSON.parse(savedNameHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('appName', appName);
  }, [appName]);

  useEffect(() => {
    localStorage.setItem('youtubeUrl', youtubeUrl);
  }, [youtubeUrl]);

  useEffect(() => {
    localStorage.setItem('useDefaultSound', useDefaultSound);
  }, [useDefaultSound]);

  useEffect(() => {
    localStorage.setItem('isEnglish', isEnglish);
  }, [isEnglish]);

  useEffect(() => {
    localStorage.setItem('youtubeHistory', JSON.stringify(youtubeHistory));
  }, [youtubeHistory]);

  useEffect(() => {
    localStorage.setItem('timerHistory', JSON.stringify(timerHistory));
  }, [timerHistory]);

  useEffect(() => {
    localStorage.setItem('nameHistory', JSON.stringify(nameHistory));
  }, [nameHistory]);

  // Dodaj URL YouTube do historii (bez powtórzeń)
  const addToYoutubeHistory = (url) => {
    if (!youtubeHistory.includes(url)) {
      setYoutubeHistory((prev) => [url, ...prev].slice(0, 5)); // Maksymalnie 5 pozycji
    }
  };

  // Dodaj timer do historii
  const addToTimerHistory = (timer) => {
    setTimerHistory((prev) => [timer, ...prev].slice(0, 5)); // Maksymalnie 5 pozycji
  };

  // Dodaj nazwę do historii
  const addToNameHistory = (name) => {
    if (!nameHistory.includes(name)) {
      setNameHistory((prev) => [name, ...prev].slice(0, 5)); // Maksymalnie 5 pozycji
    }
  };

  // Funkcja do odtwarzania alarmu
  const playAlarm = useCallback(() => {
    if (useDefaultSound) {
      if (audioElement.current) {
        audioElement.current.play().catch((err) => console.warn('Error playing sound:', err));
      }
    } else if (isMobileDevice()) {
      const videoId = getYoutubeVideoId(youtubeUrl);
      if (videoId) {
        openYoutubeInApp(videoId); // Używamy funkcji do otwierania w aplikacji
      }
    } else {
      setShowYoutubeVideo(true);
    }
  }, [useDefaultSound, youtubeUrl]);

  // Funkcja do obsługi zakończenia odliczania
  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    playAlarm();
    if (!useDefaultSound) {
      addToYoutubeHistory(youtubeUrl); // Dodaj URL do historii
    }
  }, [playAlarm, useDefaultSound, youtubeUrl]);

  // Funkcja obliczająca pozostały czas
  const calculateTimeLeft = useCallback((end) => {
    const [endHours, endMinutes] = end.split(':').map(Number);
    const now = new Date();
    const endTime = new Date();

    endTime.setHours(endHours, endMinutes, 0, 0);

    if (endTime < now) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const diff = endTime.getTime() - now.getTime();
    return {
      minutes: Math.floor(diff / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, []);

  // Funkcja obliczająca godzinę alarmu dla niestandardowych minut
  const calculateAlarmTime = useCallback((durationMinutes) => {
    const now = new Date();
    const alarm = new Date(now.getTime() + durationMinutes * 60 * 1000);
    return alarm.toTimeString().slice(0, 5);
  }, []);

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
  }, [isRunning, endTime, timeLeft, calculateTimeLeft, handleTimerEnd]);

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

  const startTimer = useCallback(() => {
    if (endTime) {
      setTimeLeft(calculateTimeLeft(endTime));
      setAlarmTime(endTime);
      addToTimerHistory({ type: 'endTime', value: endTime });
    } else if (customMinutes) {
      const minutes = parseInt(customMinutes, 10);
      if (minutes > 0) {
        setTimeLeft({ minutes, seconds: 0 });
        setAlarmTime(calculateAlarmTime(minutes));
        addToTimerHistory({ type: 'duration', value: customMinutes });
      }
    }
    setIsRunning(true);
    setIsEditingName(false);
  }, [endTime, customMinutes, calculateTimeLeft, calculateAlarmTime]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setEndTime('');
    setCustomMinutes('');
    setTimeLeft({ minutes: 0, seconds: 0 });
    setShowYoutubeVideo(false);
    setAlarmTime('');
    setIsEditingName(true);
  }, []);

  // Dodaj nazwę do historii po zatwierdzeniu
  useEffect(() => {
    if (!isEditingName) {
      addToNameHistory(appName);
    }
  }, [isEditingName, appName]);

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
            style={{ width: '300px', height: '50px' }}
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
                style={{ width: '300px', height: '50px' }}
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
                style={{ width: '300px', height: '50px' }}
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
                  style={{ width: '300px', height: '50px' }}
                />
              </div>
            )}
            <AnimatedButton
              onClick={startTimer}
              color="#22d3ee"
              shadowColor="#22d3ee"
            >
              {texts.startTimer}
            </AnimatedButton>
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
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1`} // Usunięto wyciszenie
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <AnimatedButton
              onClick={() => setShowYoutubeVideo(false)}
              color="#ec4899"
              shadowColor="#ec4899"
            >
              {texts.closeVideo}
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Przyciski w lewym dolnym rogu */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between">
        <AnimatedButton
          onClick={resetTimer}
          color="#ec4899"
          shadowColor="#ec4899"
        >
          {texts.reset}
        </AnimatedButton>
        <AnimatedButton
          onClick={() => setShowAdvanced(!showAdvanced)}
          color="#4ade80"
          shadowColor="#4ade80"
        >
          {texts.advanced}
        </AnimatedButton>
        <AnimatedButton
          onClick={() => setIsEnglish(!isEnglish)}
          color="#8b5cf6"
          shadowColor="#8b5cf6"
        >
          {isEnglish ? 'PL' : 'ENG'}
        </AnimatedButton>
      </div>

      {/* Panel zaawansowany */}
      {showAdvanced && (
        <div className="fixed bottom-20 left-4 right-4 bg-black border-2 border-cyan-400 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">{texts.advanced}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">{texts.history}</label>
              <select
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                onChange={(e) => {
                  const selectedUrl = youtubeHistory[e.target.value];
                  if (selectedUrl) {
                    setYoutubeUrl(selectedUrl);
                    setShowAdvanced(false);
                  }
                }}
              >
                <option value="">Wybierz z historii YouTube</option>
                {youtubeHistory.map((url, index) => (
                  <option key={index} value={index}>
                    {url}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">{texts.timerHistory}</label>
              <select
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                onChange={(e) => {
                  const selectedTimer = timerHistory[e.target.value];
                  if (selectedTimer) {
                    if (selectedTimer.type === 'endTime') {
                      setEndTime(selectedTimer.value);
                      setCustomMinutes('');
                    } else if (selectedTimer.type === 'duration') {
                      setCustomMinutes(selectedTimer.value);
                      setEndTime('');
                    }
                    setShowAdvanced(false);
                  }
                }}
              >
                <option value="">Wybierz z historii liczników</option>
                {timerHistory.map((timer, index) => (
                  <option key={index} value={index}>
                    {timer.type === 'endTime' ? `End Time: ${timer.value}` : `Duration: ${timer.value} minutes`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">{texts.nameHistory}</label>
              <select
                className="w-full bg-black border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 placeholder-cyan-700 focus:outline-none focus:border-purple-500"
                onChange={(e) => {
                  const selectedName = nameHistory[e.target.value];
                  if (selectedName) {
                    setAppName(selectedName);
                    setShowAdvanced(false);
                  }
                }}
              >
                <option value="">Wybierz z historii nazw</option>
                {nameHistory.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

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