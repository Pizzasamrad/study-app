import * as storageService from './storageService';
import * as firebaseService from './firebaseService';

// Mock Firebase service
jest.mock('./firebaseService', () => ({
  getCurrentUser: jest.fn(),
  saveDocument: jest.fn(),
  getDocuments: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Storage Mode Management', () => {
    test('initializes with local storage mode by default', async () => {
      firebaseService.getCurrentUser.mockResolvedValue(null);
      
      const mode = await storageService.initStorageMode();
      expect(mode).toBe(storageService.STORAGE_MODES.LOCAL);
    });

    test('can set storage mode', () => {
      const result = storageService.setStorageMode(storageService.STORAGE_MODES.CLOUD);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('studyapp-storage-mode', 'cloud');
    });

    test('rejects invalid storage mode', () => {
      const result = storageService.setStorageMode('invalid');
      expect(result).toBe(false);
    });
  });

  describe('Local Storage Operations', () => {
    test('saves flashcard to local storage', async () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const flashcard = { front: 'Question', back: 'Answer', subject: 'Math' };
      const result = await storageService.saveFlashcard(flashcard);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result.front).toBe('Question');
    });

    test('retrieves flashcards from local storage', async () => {
      const mockData = [{ id: '1', front: 'Q1', back: 'A1' }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const result = await storageService.getFlashcards();
      expect(result).toEqual(mockData);
    });
  });

  describe('Cloud Storage Operations', () => {
    beforeEach(() => {
      storageService.setStorageMode(storageService.STORAGE_MODES.CLOUD);
    });

    test('saves flashcard to cloud storage', async () => {
      const mockCard = { id: '1', front: 'Question', back: 'Answer' };
      firebaseService.saveDocument.mockResolvedValue(mockCard);
      
      const flashcard = { front: 'Question', back: 'Answer', subject: 'Math' };
      const result = await storageService.saveFlashcard(flashcard);
      
      expect(firebaseService.saveDocument).toHaveBeenCalledWith('flashcards', flashcard);
      expect(result).toEqual(mockCard);
    });

    test('falls back to local storage when cloud fails', async () => {
      firebaseService.saveDocument.mockRejectedValue(new Error('Network error'));
      localStorageMock.getItem.mockReturnValue('[]');
      
      const flashcard = { front: 'Question', back: 'Answer', subject: 'Math' };
      const result = await storageService.saveFlashcard(flashcard);
      
      expect(result).toHaveProperty('id');
      expect(result.front).toBe('Question');
    });
  });

  describe('Data Migration', () => {
    test('migrates local data to cloud', async () => {
      const mockUser = { uid: 'user123' };
      firebaseService.getCurrentUser.mockResolvedValue(mockUser);
      
      const localData = [
        { id: '1', front: 'Q1', back: 'A1' },
        { id: '2', front: 'Q2', back: 'A2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(localData));
      
      firebaseService.saveDocument.mockResolvedValue({});
      
      const result = await storageService.migrateLocalToCloud();
      
      expect(result.flashcards).toBe(2);
      expect(firebaseService.saveDocument).toHaveBeenCalledTimes(2);
    });

    test('throws error when user not authenticated for migration', async () => {
      firebaseService.getCurrentUser.mockResolvedValue(null);
      
      await expect(storageService.migrateLocalToCloud()).rejects.toThrow('User not authenticated');
    });
  });
});