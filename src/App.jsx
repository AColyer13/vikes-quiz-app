import React, { useState, useEffect } from 'react';
import './App.css';

// Quiz Data: Array of questions with options and correct answers
const quizQuestions = [
  { q: "Which Vikings defensive lineman recorded a safety in the 1970 season, showcasing the dominance of the Purple People Eaters?", o: ["Alan Page","Jim Marshall","Carl Eller","Gary Larsen"], a: 0 },
  { q: "Who led the Vikings in rushing yards during the 1970 season?", o: ["Dave Osborn","Chuck Foreman","Oscar Reed","Clint Jones"], a: 0 },
  { q: "Which Vikings player had the longest interception return in the 1970 season?", o: ["Paul Krause","Ed Sharockman","Charlie West","Karl Kassulke"], a: 1 },
  { q: "In 1970, which Vikings linebacker was known for his coverage skills and recorded multiple interceptions?", o: ["Roy Winston","Jeff Siemon","Wally Hilgenberg","Lonnie Warwick"], a: 3 },
  { q: "Which team handed the Vikings their first loss of the 1970 season, ending a 5-game win streak?", o: ["St. Louis Cardinals","San Francisco 49ers","Detroit Lions","Dallas Cowboys"], a: 0 },
  { q: "What was the Vikings' point differential at the end of the 1970 regular season?", o: ["+140","+124","+98","+112"], a: 1 },
  { q: "Which Vikings offensive lineman was selected to the Pro Bowl in 1970 for his run-blocking dominance?", o: ["Grady Alderman","Mick Tingelhoff","Ed White","Steve Riley"], a: 0 },
  { q: "Which Vikings wide receiver caught a 65-yard touchdown pass in the 1970 playoff loss to the 49ers?", o: ["Gene Washington","Bob Grim","John Beasley","John Henderson"], a: 1 },
  { q: "Who was the Vikings' punter in 1970, known for his hang time and directional kicking?", o: ["Mike Eischeid","Greg Coleman","Bob Lee","Tommy Kramer"], a: 0 },
  { q: "Which Vikings assistant coach in 1970 later became an NFL head coach and GM?", o: ["Jerry Burns","Pete Carroll","Tony Dungy","Mike Lynn"], a: 0 }
];

// Utility: Shuffle array in place using Fisher-Yates algorithm
const shuffleArray = (array) => {
  // Defensive copy to avoid mutating original array
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Utility: Sanitize text for safe rendering (basic XSS prevention)
const sanitizeText = (text) => {
  // React escapes by default, but if using dangerouslySetInnerHTML, sanitize here
  // For now, just ensure it's a string
  return String(text);
};

function App() {
  // State variables
  const [items, setItems] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [currentSection, setCurrentSection] = useState('start');

  /**
   * Start the quiz: shuffle questions and options, reset state.
   */
  const startQuiz = () => {
    try {
      const newItems = quizQuestions.map(({ q, o, a }) => {
        // Shuffle options and track correct answer index
        const opts = shuffleArray(o.map((t, i) => ({ t, c: i === a })));
        return {
          q: sanitizeText(q),
          opts: opts.map(x => sanitizeText(x.t)),
          a: opts.findIndex(x => x.c),
          pick: null
        };
      });
      setItems(shuffleArray(newItems));
      setCurrentQuestionIdx(0);
      setScore(0);
      setCurrentSection('quiz');
    } catch (err) {
      console.error('Error starting quiz:', err);
      alert('Failed to start quiz. Please reload.');
    }
  };

  /**
   * Handle user choice, update score, show correct/incorrect feedback.
   * @param {number} selectedIdx - Index of selected option
   */
  const chooseOption = (selectedIdx) => {
    try {
      const currentItem = items[currentQuestionIdx];
      if (currentItem.pick !== null) return; // Prevent double pick
      const updatedItems = [...items];
      updatedItems[currentQuestionIdx].pick = selectedIdx;
      setItems(updatedItems);
      if (selectedIdx === currentItem.a) setScore(prev => prev + 1);

      // Vibrate for feedback if supported (mobile UX)
      if (navigator.vibrate) navigator.vibrate(12);

      // Remove focus from the selected button to prevent persistent outline
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    } catch (err) {
      console.error('Error choosing option:', err);
    }
  };

  /**
   * Go to next question or finish quiz.
   */
  const goToNextQuestion = () => {
    // Remove focus from the next button to prevent persistent outline
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    if (currentQuestionIdx + 1 < items.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setCurrentSection('score');
      setReviewIdx(0);
    }
  };

  /**
   * Restart quiz and reset state.
   */
  const restartQuiz = () => {
    setItems([]);
    setCurrentSection('start');
  };

  // Theme: Set day/night mode based on time
  useEffect(() => {
    const setTimeTheme = () => {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      document.body.classList.toggle('day-mode', isDay);
      document.body.classList.toggle('night-mode', !isDay);
    };
    setTimeTheme();
    const interval = setInterval(setTimeTheme, 5 * 60 * 1000);
    const visibilityListener = () => {
      if (!document.hidden) setTimeTheme();
    };
    document.addEventListener('visibilitychange', visibilityListener);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', visibilityListener);
    };
  }, []);

  // Prevent pinch-to-zoom (for mobile UX)
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => {
      document.addEventListener(ev, prevent, { passive: false });
    });
    return () => {
      ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => {
        document.removeEventListener(ev, prevent);
      });
    };
  }, []);

  // Scroll lock and centering for responsive UX
  useEffect(() => {
    const updateScrollLock = () => {
      const body = document.body;
      const isResults = currentSection === 'score';
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const narrow = window.innerWidth <= 820;
      const shouldLockPortrait = !isResults && isCoarse && isPortrait && narrow && items.length > 0;
      const landscapeCanLock = !isResults && isCoarse && isLandscape && narrow && items.length > 0;
      const landscapeShort = window.innerHeight <= 520;
      const shouldLockLandscape = landscapeCanLock && !landscapeShort;
      body.classList.toggle('lock-scroll', shouldLockPortrait);
      body.classList.toggle('lock-scroll-land', shouldLockLandscape);
    };

    const updateCentering = () => {
      // Always center when showing the score view (keeps panel centered reliably)
      if (currentSection === 'score') {
        document.body.classList.add('center-score');
      } else {
        document.body.classList.remove('center-score');
      }
    };

    updateScrollLock();
    updateCentering();

    const resizeListener = () => {
      requestAnimationFrame(() => {
        updateScrollLock();
        updateCentering();
      });
    };

    window.addEventListener('resize', resizeListener);
    window.addEventListener('orientationchange', resizeListener);
    const visibilityListener = () => {
      if (!document.hidden) {
        updateScrollLock();
        updateCentering();
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('orientationchange', resizeListener);
      document.removeEventListener('visibilitychange', visibilityListener);
    };
  }, [currentSection, items, currentQuestionIdx, reviewIdx]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (currentSection === 'start') {
          startQuiz();
          e.preventDefault();
        } else if (currentSection === 'quiz' && items[currentQuestionIdx]?.pick !== null) {
          goToNextQuestion();
          e.preventDefault();
        } else if (currentSection === 'score' && document.activeElement?.id === 'restart-button') {
          restartQuiz();
          e.preventDefault();
        }
      } else if (currentSection === 'score') {
        if (e.key === 'ArrowLeft' && reviewIdx > 0) {
          setReviewIdx(prev => prev - 1);
          e.preventDefault();
        } else if (e.key === 'ArrowRight' && reviewIdx < items.length - 1) {
          setReviewIdx(prev => prev + 1);
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, currentQuestionIdx, reviewIdx, items]);

  // Render sections
  if (currentSection === 'start') {
    return (
      <div id="start-container" className="card-panel active">
        <h1 className="main-heading">Minnesota Vikings Quiz</h1>
        <button
          id="start-button"
          className="vikings-btn"
          onClick={startQuiz}
          aria-label="Start Quiz"
        >
          Start Quiz
        </button>
      </div>
    );
  } else if (currentSection === 'quiz') {
    const currentItem = items[currentQuestionIdx];
    const progress = ((currentQuestionIdx + (currentItem.pick !== null ? 1 : 0)) / items.length) * 100;
    return (
      <div id="quiz-container" className="card-panel active">
        <h1 className="main-heading">Minnesota Vikings Quiz</h1>
        <div id="question-container">
          <div className="q-block text-center">
            <span className="badge bg-warning text-dark mb-2 d-inline-block">
              Question {currentQuestionIdx + 1} of {items.length}
            </span>
            <div className="question-box-fixed">
              <h3 className="question-flex">{currentItem.q}</h3>
            </div>
          </div>
        </div>

        <progress id="quiz-progress" value={progress} max="100" />

        <div id="options-container">
          {currentItem.opts.map((optionText, i) => {
            // Option button styling based on answer state
            let className = 'btn btn-warning w-100 fw-bold option-btn tappable';
            let style = {};
            let disabled = false;
            if (currentItem.pick !== null) {
              if (i === currentItem.a) {
                className = className.replace('btn-warning', 'btn-success');
                style = { backgroundColor: '#28a745', color: '#fff' };
              } else if (i === currentItem.pick) {
                className = className.replace('btn-warning', 'btn-danger');
                style = { backgroundColor: '#dc3545', color: '#fff' };
              } else {
                className += ' option-faded';
                style = { opacity: 0.5 };
                disabled = true;
              }
            }
            return (
              <button
                key={i}
                className={className}
                style={style}
                onClick={() => chooseOption(i)}
                disabled={disabled}
                aria-label={`Option ${i + 1}: ${optionText}`}
              >
                {optionText}
              </button>
            );
          })}

          {currentItem.pick !== null && (
            <button
              id="next-button"
              className="vikings-btn option-btn"
              onClick={goToNextQuestion}
              aria-label="Next Question"
            >
              Next Question (ENTER)
            </button>
          )}
        </div>
      </div>
    );
  } else if (currentSection === 'score') {
    const reviewItem = items[reviewIdx];
    const correctText = reviewItem.opts[reviewItem.a];
    const userPicked = reviewItem.pick !== null ? reviewItem.opts[reviewItem.pick] : null;
    const isCorrect = reviewItem.pick === reviewItem.a;
    return (
      <div id="score-container" className="card-panel active">
        <h2 className="score-title text-warning">Your Score:</h2>
        <div id="score-display" className="score-display">{score}</div>
        <div id="summary-container" className="review-panel">
          <div className="review-card">
            <span className="badge bg-warning text-dark d-inline-block mb-2">
              Review {reviewIdx + 1} of {items.length}
            </span>
            <div className="question-box-fixed mb-3">
              <h3 className="question-flex">{reviewItem.q}</h3>
            </div>
            <div className="answers mb-2">
              <div className="answer-line mb-1">
                <span className={`badge ${isCorrect ? 'bg-success text-dark' : 'bg-danger'} me-2`}>
                  Response
                </span>
                <strong className={isCorrect ? 'correct' : 'incorrect'}>
                  {userPicked ? userPicked : <em className="incorrect-label">None</em>}
                </strong>
              </div>
              <div className="answer-line">
                <span className="badge bg-success text-dark me-2">Correct</span>
                <strong>{correctText}</strong>
              </div>
            </div>
          </div>
        </div>
        <div id="review-nav" className="review-nav">
          <button
            id="review-prev"
            className="vikings-btn"
            onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
            disabled={reviewIdx === 0}
            aria-label="Previous Review"
          >
            Prev
          </button>
          <button
            id="review-next"
            className="vikings-btn"
            onClick={() => setReviewIdx(Math.min(items.length - 1, reviewIdx + 1))}
            disabled={reviewIdx === items.length - 1}
            aria-label="Next Review"
          >
            Next
          </button>
        </div>
        <button
          id="restart-button"
          className="vikings-btn"
          onClick={restartQuiz}
          aria-label="Restart Quiz"
        >
          Restart Quiz
        </button>
      </div>
    );
  }
}

export default App;

/**
 * Suggested Unit Tests (use Jest/React Testing Library):
 * - shuffleArray: test that output is a permutation, not mutated, and correct length.
 * - startQuiz: test that items are shuffled and state resets.
 * - chooseOption: test score increments only on correct pick, pick is set, and double pick is prevented.
 * - goToNextQuestion: test navigation and section change.
 * - restartQuiz: test state reset.
 */
