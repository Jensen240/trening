
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Define types for our data structures
interface PersonalInfo {
    name: string;
    age: number | '';
    weight: number | '';
}

interface Workout {
    id: number;
    date: string;
    exercise: string;
    sets: number | '';
    reps: number | '';
    weight: number | '';
}

// Translations for i18n
const translations = {
    en: {
        title: 'Fitness Training Diary',
        personalInfo: 'Personal Information',
        name: 'Name',
        namePlaceholder: 'Your Name',
        age: 'Age',
        agePlaceholder: 'Your Age',
        weight: 'Weight (kg)',
        weightPlaceholder: 'Your Weight',
        addWorkout: 'Add Workout',
        exercise: 'Exercise',
        exercisePlaceholder: 'e.g., Bench Press',
        sets: 'Sets',
        setsPlaceholder: 'e.g., 3',
        reps: 'Reps',
        repsPlaceholder: 'e.g., 10',
        workoutWeight: 'Weight (kg)',
        workoutWeightPlaceholder: 'e.g., 100',
        addWorkoutButton: 'Add Workout',
        workoutLog: 'Workout Log',
        noWorkouts: 'No workouts logged yet. Add one above!',
        fillFieldsAlert: 'Please fill out all workout fields.',
        exerciseLabel: 'Exercise',
        detailsLabel: 'Details',
        repsAndWeight: '{reps} reps @ {weight} kg',
        shareLog: 'Share Log',
        copiedToClipboard: 'Copied to clipboard!',
        workoutSummaryFor: "{name}'s Workout Summary",
        defaultWorkoutSummary: 'My Workout Summary',
        workoutSummaryTextHeader: 'Here is my workout log from the Fitness Training Diary:',
        installApp: 'Install App',
        iosInstallPrompt: "To install, tap the Share icon then 'Add to Home Screen'.",
        shareApp: 'Share App',
        shareAppTitle: 'Check out this Fitness App!',
        shareAppText: 'Track your workouts with the Fitness Training Diary app.',
        appUrlCopied: 'App URL copied to clipboard!',
    },
    no: {
        title: 'Treningsdagbok',
        personalInfo: 'Personlig Informasjon',
        name: 'Navn',
        namePlaceholder: 'Ditt Navn',
        age: 'Alder',
        agePlaceholder: 'Din Alder',
        weight: 'Vekt (kg)',
        weightPlaceholder: 'Din Vekt',
        addWorkout: 'Legg til Økt',
        exercise: 'Øvelse',
        exercisePlaceholder: 'f.eks. Benkpress',
        sets: 'Sett',
        setsPlaceholder: 'f.eks. 3',
        reps: 'Reps',
        repsPlaceholder: 'f.eks. 10',
        workoutWeight: 'Vekt (kg)',
        workoutWeightPlaceholder: 'f.eks. 100',
        addWorkoutButton: 'Legg til Økt',
        workoutLog: 'Treningslogg',
        noWorkouts: 'Ingen økter logget enda. Legg til en ovenfor!',
        fillFieldsAlert: 'Vennligst fyll ut alle feltene for økten.',
        exerciseLabel: 'Øvelse',
        detailsLabel: 'Detaljer',
        repsAndWeight: '{reps} reps @ {weight} kg',
        shareLog: 'Del Logg',
        copiedToClipboard: 'Kopiert til utklippstavlen!',
        workoutSummaryFor: '{name} sin Treningssammendrag',
        defaultWorkoutSummary: 'Mitt Treningssammendrag',
        workoutSummaryTextHeader: 'Her er min treningslogg fra Treningsdagboken:',
        installApp: 'Installer App',
        iosInstallPrompt: "For å installere, trykk på Del-ikonet og deretter 'Legg til på Hjem-skjerm'.",
        shareApp: 'Del App',
        shareAppTitle: 'Sjekk ut denne treningsappen!',
        shareAppText: 'Loggfør øktene dine med Treningsdagbok-appen.',
        appUrlCopied: 'App-URL kopiert til utklippstavlen!',
    }
};


const App = () => {
    // State for language
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
    const [toastMessage, setToastMessage] = useState('');
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [showIosInstall, setShowIosInstall] = useState(false);


    // State for personal information
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        name: '',
        age: '',
        weight: '',
    });

    // State for workout log
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    // State for the current workout being entered
    const [currentWorkout, setCurrentWorkout] = useState({
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
    });
    
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const savedPersonalInfo = localStorage.getItem('personalInfo');
            if (savedPersonalInfo) {
                setPersonalInfo(JSON.parse(savedPersonalInfo));
            }
            const savedWorkouts = localStorage.getItem('workouts');
            if (savedWorkouts) {
                setWorkouts(JSON.parse(savedWorkouts));
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;

        // Show the install prompt on iOS if it's not installed and not dismissed
        if (isIos && !isInStandaloneMode && localStorage.getItem('iosInstallDismissed') !== 'true') {
            setShowIosInstall(true);
        }
    }, []);
    
    // Save language to localStorage
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
    }, [personalInfo]);

    useEffect(() => {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }, [workouts]);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPersonalInfo(prevInfo => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleWorkoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentWorkout(prevWorkout => ({
            ...prevWorkout,
            [name]: value,
        }));
    };

    const addWorkout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkout.exercise || !currentWorkout.sets || !currentWorkout.reps || !currentWorkout.weight) {
            alert(t.fillFieldsAlert);
            return;
        }

        const newWorkout: Workout = {
            id: Date.now(),
            date: new Date().toLocaleString(language === 'no' ? 'no-NO' : 'en-US'),
            exercise: currentWorkout.exercise,
            sets: Number(currentWorkout.sets),
            reps: Number(currentWorkout.reps),
            weight: Number(currentWorkout.weight),
        };

        setWorkouts(prevWorkouts => [newWorkout, ...prevWorkouts]);
        
        // Clear form
        setCurrentWorkout({
            exercise: '',
            sets: '',
            reps: '',
            weight: '',
        });
    };
    
    const handleShare = async () => {
        if (workouts.length === 0) return;

        const title = personalInfo.name ? t.workoutSummaryFor.replace('{name}', personalInfo.name) : t.defaultWorkoutSummary;
        
        let textToShare = `${title}\n${t.workoutSummaryTextHeader}\n\n`;

        workouts.forEach(workout => {
            const workoutDetails = t.repsAndWeight
                .replace('{reps}', String(workout.reps))
                .replace('{weight}', String(workout.weight));
            
            textToShare += `${workout.date}\n`;
            textToShare += `${workout.exercise}: ${workout.sets} x ${workoutDetails}\n\n`;
        });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: textToShare,
                });
            } catch (error) {
                console.log('User cancelled share or error:', error);
            }
        } else {
            navigator.clipboard.writeText(textToShare).then(() => {
                setToastMessage(t.copiedToClipboard);
                setTimeout(() => setToastMessage(''), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };
    
    const handleInstallClick = () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            setInstallPromptEvent(null);
        });
    };
    
    const handleIosInstallDismiss = () => {
        localStorage.setItem('iosInstallDismissed', 'true');
        setShowIosInstall(false);
    };

    const handleShareApp = async () => {
        const shareData = {
            title: t.shareAppTitle,
            text: t.shareAppText,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('User cancelled share or error:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setToastMessage(t.appUrlCopied);
                setTimeout(() => setToastMessage(''), 2000);
            }).catch(err => {
                console.error('Failed to copy URL: ', err);
            });
        }
    };


    const t = translations[language];

    return (
        <main>
            <div className="top-right-controls">
                 <div className="language-switcher">
                    <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>EN</button>
                    <button onClick={() => setLanguage('no')} className={language === 'no' ? 'active' : ''}>NO</button>
                </div>
                <button onClick={handleShareApp} className="share-app-button" title={t.shareApp} aria-label={t.shareApp}>
                     <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.17c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                </button>
                {installPromptEvent && (
                    <button onClick={handleInstallClick} className="install-button" title={t.installApp} aria-label={t.installApp}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
                    </button>
                )}
            </div>

            <h1>{t.title}</h1>

            <section className="container">
                <h2>{t.personalInfo}</h2>
                <form className="personal-info-form">
                    <div className="form-group">
                        <label htmlFor="name">{t.name}</label>
                        <input type="text" id="name" name="name" value={personalInfo.name} onChange={handlePersonalInfoChange} placeholder={t.namePlaceholder} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="age">{t.age}</label>
                        <input type="number" id="age" name="age" value={personalInfo.age} onChange={handlePersonalInfoChange} placeholder={t.agePlaceholder} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="weight">{t.weight}</label>
                        <input type="number" id="weight" name="weight" value={personalInfo.weight} onChange={handlePersonalInfoChange} placeholder={t.weightPlaceholder} />
                    </div>
                </form>
            </section>

            <section className="container">
                <h2>{t.addWorkout}</h2>
                <form onSubmit={addWorkout}>
                    <div className="workout-details-form">
                        <div className="form-group">
                            <label htmlFor="exercise">{t.exercise}</label>
                            <input type="text" id="exercise" name="exercise" value={currentWorkout.exercise} onChange={handleWorkoutChange} placeholder={t.exercisePlaceholder} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sets">{t.sets}</label>
                            <input type="number" id="sets" name="sets" value={currentWorkout.sets} onChange={handleWorkoutChange} placeholder={t.setsPlaceholder} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reps">{t.reps}</label>
                            <input type="number" id="reps" name="reps" value={currentWorkout.reps} onChange={handleWorkoutChange} placeholder={t.repsPlaceholder} />
                        </div>
                         <div className="form-group">
                            <label htmlFor="workoutWeight">{t.workoutWeight}</label>
                            <input type="number" id="workoutWeight" name="weight" value={currentWorkout.weight} onChange={handleWorkoutChange} placeholder={t.workoutWeightPlaceholder} />
                        </div>
                    </div>
                    <button type="submit">{t.addWorkoutButton}</button>
                </form>
            </section>
            
            <section className="container">
                 <div className="section-header">
                    <h2>{t.workoutLog}</h2>
                     {workouts.length > 0 && (
                        <button onClick={handleShare} className="share-button">
                             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.17c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                            {t.shareLog}
                        </button>
                    )}
                </div>
                {workouts.length > 0 ? (
                    <ul className="workout-log">
                        {workouts.map(workout => (
                            <li key={workout.id} className="workout-item">
                                <p className="date">{workout.date}</p>
                                <p><strong>{t.exerciseLabel}:</strong> {workout.exercise}</p>
                                <p><strong>{t.detailsLabel}:</strong> {workout.sets} x {t.repsAndWeight.replace('{reps}', String(workout.reps)).replace('{weight}', String(workout.weight))}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{t.noWorkouts}</p>
                )}
            </section>
            {showIosInstall && (
                <div className="ios-install-banner">
                    <p>
                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="30px" viewBox="0 0 24 24" width="30px" fill="#FFFFFF"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M7,9l1.41,1.41L11,7.83V16h2V7.83l2.59,2.58L17,9l-5-5L7,9z"/></g></svg>
                        {t.iosInstallPrompt}
                    </p>
                    <button onClick={handleIosInstallDismiss} className="dismiss-button" aria-label="Dismiss">&times;</button>
                </div>
            )}
            
            {toastMessage && <div className="toast-notification">{toastMessage}</div>}
        </main>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);