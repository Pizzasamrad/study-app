import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudyApp from './App';

// Mock Firebase
jest.mock('./firebase', () => ({
  auth: {
    currentUser: null
  },
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn(); // unsubscribe function
  })
}));

// Mock storage service
jest.mock('./services/storageService', () => ({
  STORAGE_MODES: {
    LOCAL: 'local',
    CLOUD: 'cloud'
  },
  initStorageMode: jest.fn().mockResolvedValue('local'),
  getStorageMode: jest.fn().mockReturnValue('local'),
  getFlashcards: jest.fn().mockResolvedValue([]),
  getStudyLogs: jest.fn().mockResolvedValue([]),
  getBlurts: jest.fn().mockResolvedValue([]),
  saveFlashcard: jest.fn().mockResolvedValue({ id: '1', front: 'Test', back: 'Answer' }),
  saveStudyLog: jest.fn().mockResolvedValue({ id: '1', subject: 'Math', duration: 25 }),
  saveBlurt: jest.fn().mockResolvedValue({ id: '1', content: 'Test note', subject: 'General' })
}));

describe('StudyMaster Pro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main navigation tabs', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Flashcards')).toBeInTheDocument();
      expect(screen.getByText('Pomodoro')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Brain Blurts')).toBeInTheDocument();
    });
  });

  test('displays dashboard with study statistics', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      expect(screen.getByText('StudyMaster Pro')).toBeInTheDocument();
      expect(screen.getByText(/Total: 0 cards/)).toBeInTheDocument();
      expect(screen.getByText(/Due: 0 cards/)).toBeInTheDocument();
      expect(screen.getByText(/Logged: 0 sessions/)).toBeInTheDocument();
    });
  });

  test('can switch between tabs', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      const flashcardsTab = screen.getByText('Flashcards');
      fireEvent.click(flashcardsTab);
      expect(screen.getByText('Create New Flashcard')).toBeInTheDocument();
    });
  });

  test('pomodoro timer displays correctly', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      const pomodoroTab = screen.getByText('Pomodoro');
      fireEvent.click(pomodoroTab);
      expect(screen.getByText('25:00')).toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  test('can create a new flashcard', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      const flashcardsTab = screen.getByText('Flashcards');
      fireEvent.click(flashcardsTab);
      
      const createButton = screen.getByText('Create New Flashcard');
      fireEvent.click(createButton);
      
      expect(screen.getByPlaceholderText('What is the capital of France?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Paris')).toBeInTheDocument();
    });
  });

  test('brain blurts section works', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      const blurtsTab = screen.getByText('Brain Blurts');
      fireEvent.click(blurtsTab);
      
      expect(screen.getByPlaceholderText('Quick thought, idea, or note...')).toBeInTheDocument();
      expect(screen.getByText('Save Blurt')).toBeInTheDocument();
    });
  });

  test('analytics tab displays study insights', async () => {
    render(<StudyApp />);
    
    await waitFor(() => {
      const analyticsTab = screen.getAllByText('Analytics')[0]; // Get the first Analytics button (nav tab)
      fireEvent.click(analyticsTab);
      
      expect(screen.getByText('Study Analytics')).toBeInTheDocument();
      expect(screen.getByText('Total Study Time')).toBeInTheDocument();
    });
  });
});