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

jest.mock("../config/firebase.js", () => ({
  db: mockDb,
  admin: mockAdmin,
}));

jest.mock("../services/resourceService.js", () => ({
  getResourceDoc: jest.fn(),
}));

const { describe, it, expect, afterEach, beforeEach } = require('@jest/globals');
const billsController = require("../controllers/billsController.js");
const resourceService = require("../services/resourceService.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("billsController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBills", () => {
    it("debe retornar un array vacío si no hay cuentas", async () => {
      mockCollection.get.mockResolvedValue({ empty: true });
      const req = {};
      const res = mockRes();

      await billsController.getBills(req, res);

      expect(res.json).toHaveBeenCalledWith({ bills: [] });
    });

    it("debe retornar cuentas si existen", async () => {
      mockCollection.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "1",
            data: () => ({
              state: "pagado",
              total: 100,
              table: 1,
              created_at: "timestamp",
              user_id: "u1",
              products: [],
            }),
          },
        ],
      });
      resourceService.getResourceDoc.mockResolvedValueOnce({ exists: true, id: "u1", data: () => ({ nombre: "Juan" }) });

      const req = {};
      const res = mockRes();

      await billsController.getBills(req, res);

      expect(res.json).toHaveBeenCalledWith({
        bills: [
          {
            state: "pagado",
            total: 100,
            table: 1,
            created_at: "timestamp",
            user: { id: "u1", nombre: "Juan" },
            products: [],
            id: "1",
          },
        ],
      });
    });

    it("debe manejar errores", async () => {
      mockCollection.get.mockRejectedValue(new Error("fail"));
      const req = {};
      const res = mockRes();

      await billsController.getBills(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("createBill", () => {
    it("debe retornar 406 si faltan datos", async () => {
      const req = { body: { table: 1 } };
      const res = mockRes();

      await billsController.createBill(req, res);

      expect(res.status).toHaveBeenCalledWith(406);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it("debe crear una cuenta y retornar 201", async () => {
      mockCollection.add.mockResolvedValue({});
      const req = {
        body: {
          table: 1,
          products: [{ id: "p1" }],
          user_id: "u1",
          state: "pendiente",
          total: 50,
          id: "b1",
        },
      };
      const res = mockRes();

      await billsController.createBill(req, res);

      expect(mockCollection.add).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    it("debe manejar errores", async () => {
      mockCollection.add.mockRejectedValue(new Error("fail"));
      const req = {
        body: {
          table: 1,
          products: [{ id: "p1" }],
          user_id: "u1",
          state: "pendiente",
          total: 50,
          id: "b1",
        },
      };
      const res = mockRes();

      await billsController.createBill(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  // Puedes agregar más tests para getBillById, updateBillById y hardDeleteBill siguiendo el mismo patrón.
});