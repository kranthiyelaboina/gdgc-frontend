import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let quizSocket = null;
let connectionListeners = [];

const notifyConnectionChange = (connected) => {
    connectionListeners.forEach(listener => listener(connected));
};

export const useQuizSocket = () => {
    const [isConnected, setIsConnected] = useState(quizSocket?.connected || false);
    const [connectionError, setConnectionError] = useState(null);
    const eventHandlersRef = useRef({});

    useEffect(() => {
        const listener = (connected) => setIsConnected(connected);
        connectionListeners.push(listener);
        
        if (quizSocket?.connected) {
            setIsConnected(true);
        }
        
        return () => {
            connectionListeners = connectionListeners.filter(l => l !== listener);
        };
    }, []);

    const connect = useCallback((authData = {}) => {
        return new Promise((resolve, reject) => {
            if (quizSocket?.connected) {
                setIsConnected(true);
                resolve(true);
                return;
            }

            quizSocket = io(`${SOCKET_URL}/quiz`, {
                auth: authData,
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            const connectTimeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);

            quizSocket.on('connect', () => {
                clearTimeout(connectTimeout);
                notifyConnectionChange(true);
                setConnectionError(null);
                resolve(true);
            });

            quizSocket.on('disconnect', (reason) => {
                notifyConnectionChange(false);
            });

            quizSocket.on('connect_error', (error) => {
                clearTimeout(connectTimeout);
                setConnectionError(error.message);
                notifyConnectionChange(false);
                reject(error);
            });

            Object.entries(eventHandlersRef.current).forEach(([event, handler]) => {
                quizSocket.on(event, handler);
            });
        });
    }, []);

    const disconnect = useCallback(() => {
        if (quizSocket) {
            quizSocket.disconnect();
            quizSocket = null;
            notifyConnectionChange(false);
        }
    }, []);

    const emit = useCallback((event, data, callback) => {
        if (!quizSocket?.connected) {
            if (callback) callback({ error: 'Not connected to server' });
            return;
        }
        
        quizSocket.emit(event, data, callback);
    }, []);

    const on = useCallback((event, handler) => {
        eventHandlersRef.current[event] = handler;
        if (quizSocket) {
            quizSocket.on(event, handler);
        }
    }, []);

    const off = useCallback((event, handler) => {
        delete eventHandlersRef.current[event];
        if (quizSocket) {
            quizSocket.off(event, handler);
        }
    }, []);

    useEffect(() => {
        return () => {
        };
    }, []);

    return {
        isConnected,
        connectionError,
        connect,
        disconnect,
        emit,
        on,
        off,
        socket: quizSocket
    };
};

export const useSessionCreate = () => {
    const { emit, on, off } = useQuizSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);

    const createSession = useCallback((quizId) => {
        return new Promise((resolve, reject) => {
            setLoading(true);
            setError(null);

            emit('session:create', { quizId }, (response) => {
                setLoading(false);
                if (response.error) {
                    setError(response.error);
                    reject(response.error);
                } else {
                    setSession(response);
                    resolve(response);
                }
            });
        });
    }, [emit]);

    return { createSession, loading, error, session };
};

export const useSessionJoin = () => {
    const { emit, on, off, connect, isConnected } = useQuizSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionInfo, setSessionInfo] = useState(null);

    const joinSession = useCallback((sessionCode, userData) => {
        return new Promise((resolve, reject) => {
            setLoading(true);
            setError(null);

            if (!isConnected) {
                connect({ userData });
            }

            setTimeout(() => {
                emit('session:join', {
                    sessionCode,
                    oderId: userData.oderId || userData.rollNumber,
                    userName: userData.userName || userData.name,
                    userPhoto: userData.userPhoto
                }, (response) => {
                    setLoading(false);
                    if (response.error) {
                        setError(response.error);
                        reject(response.error);
                    } else {
                        setSessionInfo(response);
                        resolve(response);
                    }
                });
            }, 100);
        });
    }, [emit, connect, isConnected]);

    return { joinSession, loading, error, sessionInfo };
};

export const useLiveQuiz = (isAdmin = false) => {
    const { emit, on, off, isConnected } = useQuizSocket();
    
    const [status, setStatus] = useState('lobby');
    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(-1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timeLimit, setTimeLimit] = useState(30);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [personalResult, setPersonalResult] = useState(null);
    const [answerStats, setAnswerStats] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [quizComplete, setQuizComplete] = useState(false);
    const [finalResults, setFinalResults] = useState(null);
    const [sessionPaused, setSessionPaused] = useState(false);
    const [sessionInterrupted, setSessionInterrupted] = useState(false);

    const timerRef = useRef(null);
    const questionEndTimeRef = useRef(null);

    useEffect(() => {
        on('participant:joined', (data) => {
            setParticipants(prev => [...prev.filter(p => p.oderId !== data.oderId), {
                oderId: data.oderId,
                userName: data.userName,
                userPhoto: data.userPhoto
            }]);
        });

        on('participant:left', (data) => {
        });

        on('participant:disconnected', (data) => {
        });

        on('participant:reconnected', (data) => {
        });

        on('question:start', (data) => {
            setCurrentQuestion(data);
            setQuestionIndex(data.index);
            setTotalQuestions(data.total);
            setTimeLimit(data.timeLimit);
            setTimeRemaining(data.timeLimit);
            setHasAnswered(false);
            setCorrectAnswer(null);
            setPersonalResult(null);
            setStatus('in-progress');

            questionEndTimeRef.current = Date.now() + (data.timeLimit * 1000);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((questionEndTimeRef.current - Date.now()) / 1000));
                setTimeRemaining(remaining);
                if (remaining <= 0) {
                    clearInterval(timerRef.current);
                }
            }, 100);
        });

        if (isAdmin) {
            on('question:admin-info', (data) => {
                setCorrectAnswer(data.correctAnswers);
            });

            on('answer:stats', (data) => {
                setAnswerStats(data);
            });

            on('answer:all-complete', (data) => {
            });
        }

        on('question:end', (data) => {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeRemaining(0);
            setCorrectAnswer(data.correctAnswers);
            setLeaderboard(data.leaderboard);
            setAnswerStats(data.stats);
        });

        on('question:personal-result', (data) => {
            setPersonalResult(data);
        });

        on('quiz:complete', (data) => {
            setQuizComplete(true);
            setLeaderboard(data.leaderboard);
            setStatus('completed');
        });

        on('quiz:personal-final', (data) => {
            setFinalResults(data);
        });

        on('session:paused', (data) => {
            setSessionPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
        });

        on('session:interrupted', (data) => {
            setSessionInterrupted(true);
            setStatus('interrupted');
        });

        return () => {
            off('participant:joined');
            off('participant:left');
            off('participant:disconnected');
            off('participant:reconnected');
            off('question:start');
            off('question:admin-info');
            off('answer:stats');
            off('answer:all-complete');
            off('question:end');
            off('question:personal-result');
            off('quiz:complete');
            off('quiz:personal-final');
            off('session:paused');
            off('session:interrupted');
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [on, off, isAdmin, isConnected]);

    const nextQuestion = useCallback((sessionCode) => {
        return new Promise((resolve, reject) => {
            emit('question:next', { sessionCode }, (response) => {
                if (response.error) reject(response.error);
                else resolve(response);
            });
        });
    }, [emit]);

    const skipTimer = useCallback((sessionCode) => {
        return new Promise((resolve, reject) => {
            emit('question:skip', { sessionCode }, (response) => {
                if (response.error) reject(response.error);
                else resolve(response);
            });
        });
    }, [emit]);

    const endSession = useCallback((sessionCode) => {
        return new Promise((resolve, reject) => {
            emit('session:end', { sessionCode }, (response) => {
                if (response.error) reject(response.error);
                else resolve(response);
            });
        });
    }, [emit]);

    const getSessionState = useCallback((sessionCode) => {
        return new Promise((resolve, reject) => {
            emit('session:state', { sessionCode }, (response) => {
                if (response.error) reject(response.error);
                else {
                    setParticipants(response.participants || []);
                    setLeaderboard(response.leaderboard || []);
                    setStatus(response.status);
                    setQuestionIndex(response.currentQuestionIndex);
                    setTotalQuestions(response.totalQuestions);
                    resolve(response);
                }
            });
        });
    }, [emit]);

    const submitAnswer = useCallback((sessionCode, questionIndex, selectedOption) => {
        return new Promise((resolve, reject) => {
            emit('answer:submit', { sessionCode, questionIndex, selectedOption }, (response) => {
                if (response.error) reject(response.error);
                else {
                    setHasAnswered(true);
                    resolve(response);
                }
            });
        });
    }, [emit]);

    const leaveSession = useCallback((sessionCode) => {
        emit('session:leave', { sessionCode });
    }, [emit]);

    return {
        isConnected,
        status,
        participants,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeRemaining,
        timeLimit,
        hasAnswered,
        leaderboard,
        personalResult,
        answerStats,
        correctAnswer,
        quizComplete,
        finalResults,
        sessionPaused,
        sessionInterrupted,
        nextQuestion,
        skipTimer,
        endSession,
        getSessionState,
        submitAnswer,
        leaveSession
    };
};

export default useQuizSocket;