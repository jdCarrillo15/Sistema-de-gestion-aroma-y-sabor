// src/__tests__/jest.setup.js
import { jest } from "@jest/globals";
// Aquí puedes agregar mocks globales si los necesitas, ej:
// global.fetch = jest.fn();

const mockCollection = {
  get: jest.fn(),
  add: jest.fn(),
  doc: jest.fn(() => ({
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};
const mockDb = {
  collection: jest.fn(() => mockCollection),
};
const mockAdmin = {
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => "timestamp"),
    },
  },
};
