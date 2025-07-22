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
    time: string; // e.g., "14:35"
    exercise: string;
    sets: number | '';
    reps: number | '';
    weight: number | '';
}

// A version of Workout for the temporary batch, without id, date, or time
type WorkoutBatchItem = Omit<Workout, 'id' | 'time'>;


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
        addExerciseToSession: 'Add Exercise',
        logSession: 'Log Session',
        currentSession: 'Current Session',
        remove: 'Remove',
        sessionEmpty: 'Add an exercise to start a session.',
        date: 'Date',
        deleteWorkout: 'Delete Workout',
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
        addExerciseToSession: 'Legg til Øvelse',
        logSession: 'Loggfør Økt',
        currentSession: 'Nåværende Økt',
        remove: 'Fjern',
        sessionEmpty: 'Legg til en øvelse for å starte en økt.',
        date: 'Dato',
        deleteWorkout: 'Slett økt',
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

    // State for workout log (grouped by date)
    const [groupedWorkouts, setGroupedWorkouts] = useState<{ [key: string]: Workout[] }>({});
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // State for batching workouts before logging
    const [workoutBatch, setWorkoutBatch] = useState<WorkoutBatchItem[]>([]);
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

    // State for the current workout being entered
    const [currentWorkout, setCurrentWorkout] = useState<WorkoutBatchItem>({
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

    // Load and migrate data from localStorage on initial render
    useEffect(() => {
        try {
            const savedPersonalInfo = localStorage.getItem('personalInfo');
            if (savedPersonalInfo) {
                setPersonalInfo(JSON.parse(savedPersonalInfo));
            }

            const savedGroupedWorkouts = localStorage.getItem('groupedWorkouts');
            if (savedGroupedWorkouts) {
                setGroupedWorkouts(JSON.parse(savedGroupedWorkouts));
            } else {
                // Check for old, flat workout data and migrate it
                const oldSavedWorkouts = localStorage.getItem('workouts');
                if (oldSavedWorkouts) {
                    const oldWorkouts: (Workout & { date: string })[] = JSON.parse(oldSavedWorkouts);
                    const newGroupedData: { [key: string]: Workout[] } = {};

                    oldWorkouts.forEach(w => {
                        const d = new Date(w.date);
                        if (!isNaN(d.getTime())) {
                            const dateKey = d.toISOString().split('T')[0];
                            if (!newGroupedData[dateKey]) {
                                newGroupedData[dateKey] = [];
                            }
                            const { date, ...workoutData } = w;
                            newGroupedData[dateKey].push({ ...workoutData, time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
                        }
                    });

                    setGroupedWorkouts(newGroupedData);
                    localStorage.setItem('groupedWorkouts', JSON.stringify(newGroupedData));
                    localStorage.removeItem('workouts'); // Clean up old data
                }
            }
        } catch (error) {
            console.error("Failed to parse or migrate data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;

        if (isIos && !isInStandaloneMode && localStorage.getItem('iosInstallDismissed') !== 'true') {
            setShowIosInstall(true);
        }
    }, []);
    
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
    }, [personalInfo]);

    useEffect(() => {
        localStorage.setItem('groupedWorkouts', JSON.stringify(groupedWorkouts));
    }, [groupedWorkouts]);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPersonalInfo(prevInfo => ({ ...prevInfo, [name]: value }));
    };

    const handleWorkoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentWorkout(prevWorkout => ({ ...prevWorkout, [name]: value }));
    };

    const handleAddExerciseToBatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkout.exercise || !currentWorkout.sets || !currentWorkout.reps || !currentWorkout.weight) {
            alert(t.fillFieldsAlert);
            return;
        }

        const newExercise: WorkoutBatchItem = {
            exercise: currentWorkout.exercise,
            sets: Number(currentWorkout.sets),
            reps: Number(currentWorkout.reps),
            weight: Number(currentWorkout.weight),
        };

        setWorkoutBatch(prevBatch => [...prevBatch, newExercise]);
        
        setCurrentWorkout({ exercise: '', sets: '', reps: '', weight: '' });
    };
    
    const handleLogSession = () => {
        if (workoutBatch.length === 0) return;

        const time = new Date().toLocaleTimeString(language === 'no' ? 'no-NO' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        const newWorkoutsForSession: Workout[] = workoutBatch.map((item, index) => ({
            ...item,
            id: Date.now() + index,
            time: time
        }));

        setGroupedWorkouts(prev => {
            const newGroups = { ...prev };
            const existingDayWorkouts = newGroups[sessionDate] || [];
            newGroups[sessionDate] = [...newWorkoutsForSession, ...existingDayWorkouts];
            return newGroups;
        });

        setWorkoutBatch([]);
    };

    const handleRemoveFromBatch = (indexToRemove: number) => {
        setWorkoutBatch(prevBatch => prevBatch.filter((_, index) => index !== indexToRemove));
    };

    const handleDeleteWorkout = (dateKey: string, workoutId: number) => {
        setGroupedWorkouts(prev => {
            const newGroups = { ...prev };
            const updatedDayWorkouts = newGroups[dateKey].filter(w => w.id !== workoutId);
            
            if (updatedDayWorkouts.length === 0) {
                delete newGroups[dateKey];
            } else {
                newGroups[dateKey] = updatedDayWorkouts;
            }
            
            return newGroups;
        });
    };
    
    const handleShare = async () => {
        const title = personalInfo.name ? t.workoutSummaryFor.replace('{name}', personalInfo.name) : t.defaultWorkoutSummary;
        let textToShare = `${title}\n${t.workoutSummaryTextHeader}\n\n`;

        Object.keys(groupedWorkouts).sort().reverse().forEach(dateKey => {
            const date = new Date(dateKey).toLocaleDateString(language === 'no' ? 'no-NO' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
            textToShare += `--- ${date} ---\n`;
            groupedWorkouts[dateKey].forEach(workout => {
                const workoutDetails = t.repsAndWeight.replace('{reps}', String(workout.reps)).replace('{weight}', String(workout.weight));
                textToShare += `${workout.time} - ${workout.exercise}: ${workout.sets} x ${workoutDetails}\n`;
            });
            textToShare += '\n';
        });

        if (navigator.share) {
            try {
                await navigator.share({ title: title, text: textToShare });
            } catch (error) {
                console.log('User cancelled share or error:', error);
            }
        } else {
            navigator.clipboard.writeText(textToShare).then(() => {
                setToastMessage(t.copiedToClipboard);
                setTimeout(() => setToastMessage(''), 2000);
            });
        }
    };
    
    const handleInstallClick = () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
    };
    
    const handleIosInstallDismiss = () => {
        localStorage.setItem('iosInstallDismissed', 'true');
        setShowIosInstall(false);
    };

    const handleShareApp = async () => {
        const shareData = { title: t.shareAppTitle, text: t.shareAppText, url: window.location.href };
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setToastMessage(t.appUrlCopied);
                setTimeout(() => setToastMessage(''), 2000);
            });
        }
    };

    const t = translations[language];
    const sortedDateKeys = Object.keys(groupedWorkouts).sort().reverse();

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
                <div className="form-group">
                    <label htmlFor="sessionDate">{t.date}</label>
                    <input type="date" id="sessionDate" name="sessionDate" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                </div>
                <form onSubmit={handleAddExerciseToBatch}>
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
                    <button type="submit">{t.addExerciseToSession}</button>
                </form>
                 <div className="current-session-container">
                    <h3>{t.currentSession}</h3>
                    {workoutBatch.length > 0 ? (
                        <>
                            <ul className="current-session-log">
                                {workoutBatch.map((item, index) => (
                                    <li key={index} className="batch-item">
                                        <span>
                                            <strong>{item.exercise}</strong>: {item.sets} x {t.repsAndWeight.replace('{reps}', String(item.reps)).replace('{weight}', String(item.weight))}
                                        </span>
                                        <button onClick={() => handleRemoveFromBatch(index)} className="remove-button" aria-label={t.remove}>&times;</button>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleLogSession} className="log-session-button">{t.logSession}</button>
                        </>
                    ) : (
                        <p className="session-empty-message">{t.sessionEmpty}</p>
                    )}
                </div>
            </section>
            
            <section className="container">
                 <div className="section-header">
                    <h2>{t.workoutLog}</h2>
                     {sortedDateKeys.length > 0 && (
                        <button onClick={handleShare} className="share-button">
                             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.17c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                            {t.shareLog}
                        </button>
                    )}
                </div>
                {sortedDateKeys.length > 0 ? (
                    <div className="workout-log-grouped">
                        {sortedDateKeys.map(dateKey => (
                            <div key={dateKey} className="workout-day-group">
                                <button className="date-header" onClick={() => setExpandedDate(expandedDate === dateKey ? null : dateKey)}>
                                    <span>{new Date(dateKey + 'T00:00:00').toLocaleDateString(language === 'no' ? 'no-NO' : 'en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <span className={`chevron ${expandedDate === dateKey ? 'expanded' : ''}`}>&#9660;</span>
                                </button>
                                {expandedDate === dateKey && (
                                    <ul className="workout-log">
                                        {groupedWorkouts[dateKey].map(workout => (
                                            <li key={workout.id} className="workout-item">
                                                 <button onClick={() => handleDeleteWorkout(dateKey, workout.id)} className="delete-workout-button" title={t.deleteWorkout}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                                                </button>
                                                <p className="time">{workout.time}</p>
                                                <p><strong>{workout.exercise}</strong></p>
                                                <p>{workout.sets} x {t.repsAndWeight.replace('{reps}', String(workout.reps)).replace('{weight}', String(workout.weight))}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
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