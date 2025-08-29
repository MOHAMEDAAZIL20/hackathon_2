// Global Variables
let currentUser = null;
let currentRole = null;
let selectedAnswer = null;
let timeRemaining = 300;
let timerInterval = null;
let animationQueue = [];

// Data from JSON
const appData = {
  "students": [
    {
      "id": 1,
      "name": "Rahul Patra",
      "grade": 8,
      "level": 8,
      "xp": 1250,
      "totalXp": 1500,
      "streak": 7,
      "subjects": {
        "mathematics": {"progress": 85, "badges": ["Geometry Explorer", "Number Ninja"], "color": "#8B5CF6"},
        "science": {"progress": 70, "badges": ["Lab Safety Star", "Matter Detective"], "color": "#A855F7"},
        "english": {"progress": 60, "badges": ["Reading Champion"], "color": "#C084FC"},
        "odia": {"progress": 90, "badges": ["Heritage Scholar", "Language Master"], "color": "#6B46C1"},
        "social": {"progress": 75, "badges": ["Cultural Ambassador"], "color": "#7C3AED"}
      },
      "recentAchievements": ["Temple Mathematician", "7-Day Streak Master", "Cultural Explorer"],
      "currentChallenge": "Complete 3 Physics problems",
      "challengeProgress": 2,
      "challengeTotal": 3
    }
  ],
  "teachers": [
    {
      "id": 1,
      "name": "Mrs. Sunita Mohanty",
      "subject": "Mathematics",
      "class": "8A",
      "students": 28,
      "activeStudents": 25,
      "weeklyActivity": 80,
      "avgScore": 78,
      "subjectProgress": {
        "physics": 70,
        "chemistry": 85,
        "mathematics": 60,
        "biology": 75
      },
      "recentAlerts": [
        "3 students need help in Algebra",
        "Priya completed Geometry unit", 
        "Weekly quiz results available"
      ]
    }
  ],
  "systemStats": {
    "totalStudents": 2847,
    "activeTeachers": 156,
    "schools": 23,
    "dailyActiveUsers": 1234,
    "engagementIncrease": 18,
    "contentCompletion": 72,
    "avgSession": 24,
    "returnRate": 85,
    "offlineUsers": 342,
    "onlineUsers": 892
  },
  "learningModule": {
    "id": "math_geometry_temple",
    "title": "Geometry Adventures - Konark Sun Temple",
    "subject": "Mathematics",
    "grade": 8,
    "culturalContext": "Using the architectural measurements of Konark Sun Temple to learn area and perimeter calculations",
    "xpReward": 25,
    "currentStep": 3,
    "totalSteps": 8,
    "question": "Calculate the area of the Sun Temple's main sanctum if the base is a square with side length 15 meters",
    "options": ["225 sq meters", "200 sq meters", "250 sq meters", "180 sq meters"],
    "correctAnswer": 0,
    "hint": "Remember: Area of square = side × side",
    "difficulty": "Medium",
    "timeLimit": 300
  },
  "leaderboard": [
    {"rank": 1, "name": "Ananya Patel", "xp": 2850, "level": 15, "school": "Govt. High School, Puri", "streak": 21},
    {"rank": 2, "name": "Arjun Das", "xp": 2720, "level": 14, "school": "Saraswati Vidyalaya, Cuttack", "streak": 18},
    {"rank": 3, "name": "Priya Jena", "xp": 2100, "level": 12, "school": "Kalinga High School, Bhubaneswar", "streak": 12},
    {"rank": 4, "name": "Rohit Sahoo", "xp": 1980, "level": 11, "school": "Utkal Secondary School, Berhampur", "streak": 9},
    {"rank": 5, "name": "Rahul Patra", "xp": 1250, "level": 8, "school": "Village High School, Kendrapara", "streak": 7}
  ]
};

// Animation Utilities
function animateElement(element, animation, duration = 300, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      element.style.animation = `${animation} ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
      setTimeout(resolve, duration);
    }, delay);
  });
}

function animateCounter(element, target, duration = 2000) {
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

function createParticleEffect(x, y, color = '#8B5CF6') {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
    `;
    
    document.body.appendChild(particle);
    
    const angle = (Math.PI * 2 * i) / 10;
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let px = x, py = y;
    let opacity = 1;
    
    const animateParticle = () => {
      px += vx * 0.02;
      py += vy * 0.02;
      opacity -= 0.02;
      
      particle.style.left = px + 'px';
      particle.style.top = py + 'px';
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animateParticle);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(animateParticle);
  }
}

function showSuccessAnimation(element) {
  element.style.animation = 'completedPulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  
  const rect = element.getBoundingClientRect();
  createParticleEffect(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    '#10B981'
  );
}

// Loading Screen
function initializeApp() {
  const loadingScreen = document.getElementById('loading-screen');
  const landingPage = document.getElementById('landing-page');
  
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      landingPage.classList.add('active');
      initializeLandingAnimations();
    }, 500);
  }, 3000);
}

// Landing Page Animations
function initializeLandingAnimations() {
  // Animate statistics counters
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    animateCounter(stat, target);
  });
  
  // Stagger animation for floating elements
  const elements = document.querySelectorAll('.element');
  elements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.2}s`;
  });
  
  // Typing animation
  const typingText = document.querySelector('.typing-text');
  if (typingText) {
    typeWriter(typingText, typingText.textContent, 100);
  }
}

function typeWriter(element, text, speed) {
  element.textContent = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  setTimeout(type, 1000);
}

// Role Selection
function showRoleSelection() {
  console.log('showRoleSelection called');
  const modal = document.getElementById('role-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Stagger animation for role cards
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }
}

function hideRoleSelection() {
  console.log('hideRoleSelection called');
  const modal = document.getElementById('role-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function selectRole(role) {
  console.log('selectRole called with:', role);
  currentRole = role;
  
  // Add selection animation
  const selectedCard = document.querySelector(`[data-role="${role}"]`);
  if (selectedCard) {
    selectedCard.style.transform = 'scale(1.05)';
    selectedCard.style.borderColor = '#8B5CF6';
  }
  
  setTimeout(() => {
    hideRoleSelection();
    navigateToRole(role);
  }, 300);
}

function navigateToRole(role) {
  console.log('navigateToRole called with:', role);
  const landingPage = document.getElementById('landing-page');
  const targetPage = document.getElementById(`${role}-dashboard`);
  
  if (landingPage && targetPage) {
    // Slide out animation
    landingPage.style.transform = 'translateX(-100%)';
    landingPage.style.opacity = '0';
    
    setTimeout(() => {
      landingPage.classList.remove('active');
      landingPage.classList.add('hidden');
      targetPage.classList.remove('hidden');
      targetPage.classList.add('active');
      
      // Initialize dashboard based on role
      if (role === 'student') {
        initializeStudentDashboard();
      } else if (role === 'teacher') {
        initializeTeacherDashboard();
      } else if (role === 'admin') {
        initializeAdminDashboard();
      }
    }, 300);
  }
}

// Student Dashboard
function initializeStudentDashboard() {
  console.log('initializeStudentDashboard called');
  currentUser = appData.students[0];
  
  updateUserInfo();
  
  // Animate dashboard cards with stagger
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Animate subject progress rings
  setTimeout(() => {
    updateSubjectProgress();
  }, 800);
  
  // Animate achievement items
  setTimeout(() => {
    animateAchievements();
  }, 1000);
}

function updateUserInfo() {
  // Update user information in dashboard
  const studentName = document.getElementById('student-name');
  const studentLevel = document.getElementById('student-level');
  const currentXp = document.getElementById('current-xp');
  const totalXp = document.getElementById('total-xp');
  const streakCount = document.getElementById('streak-count');
  
  if (studentName) studentName.textContent = currentUser.name;
  if (studentLevel) studentLevel.textContent = currentUser.level;
  if (currentXp) currentXp.textContent = currentUser.xp;
  if (totalXp) totalXp.textContent = currentUser.totalXp;
  if (streakCount) streakCount.textContent = currentUser.streak;
  
  // Update XP bar animation
  const xpBar = document.querySelector('.progress-fill');
  if (xpBar) {
    const xpPercentage = (currentUser.xp / currentUser.totalXp) * 100;
    xpBar.style.width = `${xpPercentage}%`;
  }
}

function updateSubjectProgress() {
  const subjects = ['mathematics', 'science', 'english', 'odia'];
  
  subjects.forEach((subject, index) => {
    const subjectData = currentUser.subjects[subject];
    if (subjectData) {
      const circle = document.querySelector(`.subject-card[data-subject="${subject}"] .progress-ring-circle`);
      if (circle) {
        const circumference = 2 * Math.PI * 25;
        const strokeDashoffset = circumference - (subjectData.progress / 100) * circumference;
        
        setTimeout(() => {
          circle.style.strokeDashoffset = strokeDashoffset;
        }, index * 200);
      }
    }
  });
}

function animateAchievements() {
  const achievements = document.querySelectorAll('.achievement-item');
  achievements.forEach((achievement, index) => {
    achievement.style.opacity = '0';
    achievement.style.transform = 'translateX(-30px)';
    
    setTimeout(() => {
      achievement.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      achievement.style.opacity = '1';
      achievement.style.transform = 'translateX(0)';
    }, index * 150);
  });
}

function enterLearningModule(subject) {
  console.log('enterLearningModule called with:', subject);
  const studentDashboard = document.getElementById('student-dashboard');
  const learningModule = document.getElementById('learning-module');
  
  if (studentDashboard && learningModule) {
    // Add click animation to subject card
    const subjectCard = document.querySelector(`[data-subject="${subject}"]`);
    if (subjectCard) {
      subjectCard.style.transform = 'scale(1.05) rotateY(5deg)';
    }
    
    setTimeout(() => {
      studentDashboard.classList.remove('active');
      studentDashboard.classList.add('hidden');
      learningModule.classList.remove('hidden');
      learningModule.classList.add('active');
      
      initializeLearningModule();
    }, 300);
  }
}

function exitLearningModule() {
  console.log('exitLearningModule called');
  const studentDashboard = document.getElementById('student-dashboard');
  const learningModule = document.getElementById('learning-module');
  
  if (studentDashboard && learningModule) {
    learningModule.classList.remove('active');
    learningModule.classList.add('hidden');
    studentDashboard.classList.remove('hidden');
    studentDashboard.classList.add('active');
    
    // Update dashboard with new user info
    updateUserInfo();
  }
  
  // Reset timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// Learning Module
function initializeLearningModule() {
  console.log('initializeLearningModule called');
  timeRemaining = appData.learningModule.timeLimit;
  selectedAnswer = null;
  
  // Start timer
  startTimer();
  
  // Reset answer options
  const options = document.querySelectorAll('.option-btn');
  options.forEach(option => {
    option.classList.remove('selected', 'correct', 'incorrect');
    option.disabled = false;
  });
  
  // Disable submit button
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
  }
  
  // Hide hint
  const hintBox = document.getElementById('hint-box');
  if (hintBox) {
    hintBox.classList.add('hidden');
  }
  
  // Animate module entrance
  const moduleContent = document.querySelector('.module-content');
  if (moduleContent) {
    moduleContent.style.opacity = '0';
    moduleContent.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      moduleContent.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      moduleContent.style.opacity = '1';
      moduleContent.style.transform = 'translateY(0)';
    }, 200);
  }
}

function startTimer() {
  const timerElement = document.getElementById('time-remaining');
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    if (timerElement) {
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Add warning animation when time is low
    if (timeRemaining <= 30 && timerElement) {
      timerElement.parentElement.style.animation = 'timePulse 1s ease-in-out infinite';
    }
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  const options = document.querySelectorAll('.option-btn');
  options.forEach(option => option.disabled = true);
  
  // Show correct answer
  const correctOption = options[appData.learningModule.correctAnswer];
  if (correctOption) {
    correctOption.classList.add('correct');
  }
  
  setTimeout(() => {
    showFeedbackModal('Time\'s up! The correct answer was highlighted.', false);
  }, 1000);
}

function selectAnswer(optionIndex) {
  console.log('selectAnswer called with:', optionIndex);
  selectedAnswer = optionIndex;
  
  // Remove previous selection
  const options = document.querySelectorAll('.option-btn');
  options.forEach(option => option.classList.remove('selected'));
  
  // Add selection to clicked option
  const selectedOption = options[optionIndex];
  if (selectedOption) {
    selectedOption.classList.add('selected');
    
    // Add selection animation
    selectedOption.style.animation = 'optionSelected 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    // Create particle effect
    const rect = selectedOption.getBoundingClientRect();
    createParticleEffect(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      '#8B5CF6'
    );
  }
  
  // Enable submit button
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
  }
}

function submitAnswer() {
  console.log('submitAnswer called');
  if (selectedAnswer === null) return;
  
  const options = document.querySelectorAll('.option-btn');
  const selectedOption = options[selectedAnswer];
  const correctOption = options[appData.learningModule.correctAnswer];
  const isCorrect = selectedAnswer === appData.learningModule.correctAnswer;
  
  // Clear timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Disable all options
  options.forEach(option => option.disabled = true);
  
  if (isCorrect) {
    if (selectedOption) {
      selectedOption.classList.add('correct');
      showSuccessAnimation(selectedOption);
    }
    
    setTimeout(() => {
      updateUserProgress();
      showCelebrationModal();
    }, 1000);
  } else {
    if (selectedOption) {
      selectedOption.classList.add('incorrect');
      selectedOption.style.animation = 'incorrectAnswer 0.6s ease-in-out';
    }
    if (correctOption) {
      correctOption.classList.add('correct');
    }
    
    setTimeout(() => {
      showFeedbackModal('Incorrect answer. The correct answer is highlighted.', false);
    }, 1000);
  }
}

function showHint() {
  console.log('showHint called');
  const hintBox = document.getElementById('hint-box');
  if (hintBox) {
    hintBox.classList.remove('hidden');
    
    // Hint reveal animation
    hintBox.style.opacity = '0';
    hintBox.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      hintBox.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      hintBox.style.opacity = '1';
      hintBox.style.transform = 'translateY(0)';
    }, 100);
  }
}

function updateUserProgress() {
  currentUser.xp += appData.learningModule.xpReward;
  
  // Check if level up
  if (currentUser.xp >= currentUser.totalXp) {
    currentUser.level++;
    currentUser.totalXp = Math.floor(currentUser.totalXp * 1.2);
    showLevelUpAnimation();
  }
  
  // Update challenge progress
  if (currentUser.challengeProgress < currentUser.challengeTotal) {
    currentUser.challengeProgress++;
  }
  
  console.log('User progress updated:', currentUser);
}

function showCelebrationModal() {
  console.log('showCelebrationModal called');
  const modal = document.getElementById('celebration-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Trigger fireworks animation
    const fireworks = document.querySelectorAll('.firework');
    fireworks.forEach((firework, index) => {
      firework.style.animationDelay = `${index * 0.5}s`;
    });
  }
}

function hideCelebration() {
  console.log('hideCelebration called');
  const modal = document.getElementById('celebration-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  
  // Return to learning module or dashboard
  exitLearningModule();
}

function showLevelUpAnimation() {
  // Create a custom level up modal (simplified for now)
  const celebration = document.getElementById('celebration-modal');
  if (celebration) {
    const celebrationText = celebration.querySelector('.celebration-text h2');
    if (celebrationText) {
      celebrationText.innerHTML = '🎉 Level Up! 🎉<br><span style="font-size: 1.2rem;">You reached Level ' + currentUser.level + '!</span>';
    }
  }
}

// Leaderboard
function showLeaderboard() {
  console.log('showLeaderboard called');
  const modal = document.getElementById('leaderboard-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Animate leaderboard items
    const items = document.querySelectorAll('.leaderboard-item');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-30px)';
      
      setTimeout(() => {
        item.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }
}

function hideLeaderboard() {
  console.log('hideLeaderboard called');
  const modal = document.getElementById('leaderboard-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Teacher Dashboard
function initializeTeacherDashboard() {
  console.log('initializeTeacherDashboard called');
  const teacherData = appData.teachers[0];
  
  // Animate cards
  const cards = document.querySelectorAll('.teacher-grid .card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 150);
  });
  
  // Animate progress bars
  setTimeout(() => {
    const progressBars = document.querySelectorAll('.teacher-grid .progress-fill');
    progressBars.forEach((bar, index) => {
      const width = bar.style.width;
      bar.style.width = '0';
      
      setTimeout(() => {
        bar.style.width = width;
      }, index * 200);
    });
  }, 800);
}

// Admin Dashboard
function initializeAdminDashboard() {
  console.log('initializeAdminDashboard called');
  // Animate system stats counters
  setTimeout(() => {
    const statElements = document.querySelectorAll('.system-stats .stat-value');
    statElements.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      if (target) {
        animateCounter(stat, target);
      }
    });
  }, 500);
  
  // Animate cards
  const cards = document.querySelectorAll('.admin-grid .card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 150);
  });
  
  // Initialize real-time updates
  startRealTimeUpdates();
}

function startRealTimeUpdates() {
  // Simulate real-time data updates
  setInterval(() => {
    // Update online users count with animation
    const onlineUsersElement = document.querySelector('[data-target="892"]');
    if (onlineUsersElement) {
      const currentValue = parseInt(onlineUsersElement.textContent);
      const newValue = currentValue + Math.floor(Math.random() * 10) - 5;
      if (newValue > 0) {
        animateCounter(onlineUsersElement, newValue, 500);
      }
    }
  }, 10000); // Update every 10 seconds
}

// Logout Function
function logout() {
  console.log('logout called');
  // Fade out current page
  const currentPage = document.querySelector('.page.active');
  if (currentPage) {
    currentPage.style.opacity = '0';
    currentPage.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      // Hide current page and show landing page
      currentPage.classList.remove('active');
      currentPage.classList.add('hidden');
      
      const landingPage = document.getElementById('landing-page');
      if (landingPage) {
        landingPage.classList.remove('hidden');
        landingPage.classList.add('active');
        landingPage.style.opacity = '1';
        landingPage.style.transform = 'translateX(0)';
        
        // Re-initialize landing animations
        setTimeout(() => {
          initializeLandingAnimations();
        }, 300);
      }
      
      // Reset user data
      currentUser = null;
      currentRole = null;
      
      // Reset any timers
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }, 300);
  }
}

// Navigation Functions
function prevQuestion() {
  // Implementation for previous question navigation
  console.log('Previous question');
}

function showFeedbackModal(message, isSuccess) {
  // Create and show feedback modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isSuccess ? '✅ Correct!' : '❌ Incorrect'}</h2>
      </div>
      <div class="modal-body">
        <p>${message}</p>
        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.remove('hidden'), 100);
  
  // Auto-close after 3 seconds
  setTimeout(() => {
    if (modal.parentElement) {
      modal.remove();
    }
  }, 3000);
}

// Event Listeners Setup
function setupEventListeners() {
  console.log('Setting up event listeners');
  
  // Add event listeners to all buttons with onclick attributes
  document.addEventListener('click', function(e) {
    // Handle role selection buttons
    if (e.target.closest('[onclick*="showRoleSelection"]')) {
      e.preventDefault();
      showRoleSelection();
    }
    
    if (e.target.closest('[onclick*="hideRoleSelection"]')) {
      e.preventDefault();
      hideRoleSelection();
    }
    
    if (e.target.closest('[onclick*="selectRole"]')) {
      e.preventDefault();
      const roleMatch = e.target.closest('[onclick*="selectRole"]').getAttribute('onclick').match(/selectRole\(['"](.+?)['"]\)/);
      if (roleMatch) {
        selectRole(roleMatch[1]);
      }
    }
    
    // Handle learning module buttons
    if (e.target.closest('[onclick*="enterLearningModule"]')) {
      e.preventDefault();
      const subjectMatch = e.target.closest('[onclick*="enterLearningModule"]').getAttribute('onclick').match(/enterLearningModule\(['"](.+?)['"]\)/);
      if (subjectMatch) {
        enterLearningModule(subjectMatch[1]);
      }
    }
    
    if (e.target.closest('[onclick*="exitLearningModule"]')) {
      e.preventDefault();
      exitLearningModule();
    }
    
    if (e.target.closest('[onclick*="selectAnswer"]')) {
      e.preventDefault();
      const answerMatch = e.target.closest('[onclick*="selectAnswer"]').getAttribute('onclick').match(/selectAnswer\((\d+)\)/);
      if (answerMatch) {
        selectAnswer(parseInt(answerMatch[1]));
      }
    }
    
    if (e.target.closest('[onclick*="submitAnswer"]')) {
      e.preventDefault();
      submitAnswer();
    }
    
    if (e.target.closest('[onclick*="showHint"]')) {
      e.preventDefault();
      showHint();
    }
    
    // Handle modal buttons
    if (e.target.closest('[onclick*="showLeaderboard"]')) {
      e.preventDefault();
      showLeaderboard();
    }
    
    if (e.target.closest('[onclick*="hideLeaderboard"]')) {
      e.preventDefault();
      hideLeaderboard();
    }
    
    if (e.target.closest('[onclick*="hideCelebration"]')) {
      e.preventDefault();
      hideCelebration();
    }
    
    // Handle logout buttons
    if (e.target.closest('[onclick*="logout"]')) {
      e.preventDefault();
      logout();
    }
  });
}

// Enhanced Button Interactions
function addButtonAnimations() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
    
    button.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(0) scale(0.98)';
    });
    
    button.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });
  });
}

// Card Hover Effects
function addCardAnimations() {
  const cards = document.querySelectorAll('.card, .subject-card, .role-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
      this.style.boxShadow = '0 20px 40px rgba(107, 70, 193, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.1)';
    });
  });
}

// Particle System for Background
function createBackgroundParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'background-particles';
  particlesContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  `;
  
  document.body.appendChild(particlesContainer);
  
  // Create floating particles
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      createFloatingParticle(particlesContainer);
    }, i * 500);
  }
}

function createFloatingParticle(container) {
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(139, 92, 246, 0.3);
    border-radius: 50%;
    left: ${Math.random() * 100}%;
    top: 100%;
    animation: floatUp 15s linear infinite;
  `;
  
  container.appendChild(particle);
  
  // Remove particle after animation
  setTimeout(() => {
    if (particle.parentElement) {
      particle.remove();
    }
  }, 15000);
  
  // Create new particle to maintain count
  setTimeout(() => {
    createFloatingParticle(container);
  }, 15000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app');
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes floatUp {
      from { 
        transform: translateY(0) scale(1);
        opacity: 0.3;
      }
      50% {
        opacity: 0.6;
      }
      to { 
        transform: translateY(-100vh) scale(1.5);
        opacity: 0;
      }
    }
    
    @keyframes timePulse {
      0%, 100% { 
        background: #FEF3C7;
        transform: scale(1);
      }
      50% { 
        background: #FBBF24;
        transform: scale(1.05);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Setup event listeners first
  setupEventListeners();
  
  // Initialize animations
  addButtonAnimations();
  addCardAnimations();
  createBackgroundParticles();
  
  // Start the app
  initializeApp();
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close any open modals
      const openModals = document.querySelectorAll('.modal:not(.hidden)');
      openModals.forEach(modal => modal.classList.add('hidden'));
    }
    
    // Quick answer selection in learning module (1-4 keys)
    if (currentRole === 'student' && document.getElementById('learning-module') && document.getElementById('learning-module').classList.contains('active')) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        selectAnswer(num - 1);
      }
      
      if (e.key === 'Enter' && selectedAnswer !== null) {
        submitAnswer();
      }
    }
  });
});