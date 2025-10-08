import * as billsController from "../controllers/billsController.js";
import { admin, db } from "../config/firebase.js";
import { getResourceDoc } from "../services/resourceService.js";

jest.mock("../config/firebase.js", () => ({
  admin: {
    firestore: {
      FieldValue: {
        increment: jest.fn((val) => val),
        serverTimestamp: jest.fn(() => new Date()),
      },
    },
  },
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("../services/resourceService.js", () => ({
  getResourceDoc: jest.fn(),
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockDoc = { update: jest.fn(), get: jest.fn(), delete: jest.fn() };

const mockCollection = {
  doc: jest.fn(() => mockDoc),
  get: jest.fn(),
  add: jest.fn(),
  where: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  db.collection.mockReturnValue(mockCollection);
});

jest.spyOn(console, "log").mockImplementation(() => {});

describe("billsController", () => {
  describe("getBills", () => {
    it("debe retornar una lista vacía si no hay cuentas", async () => {
      mockCollection.get.mockResolvedValue({ empty: true });
      const res = mockRes();
      await billsController.getBills({}, res);
      expect(res.json).toHaveBeenCalledWith({ bills: [] });
    });

    it("debe retornar las cuentas con datos de usuario", async () => {
      const billDoc = {
        id: "1",
        data: () => ({
          state: "open",
          total: 100,
          table: 5,
          user_id: "u1",
          products: [],
        }),
      };
      mockCollection.get.mockResolvedValue({ empty: false, docs: [billDoc] });
      db.collection.mockImplementation((col) => {
        if (col === "users") {
          return {
            doc: () => ({
              get: () =>
                Promise.resolve({ id: "u1", data: () => ({ name: "John" }) }),
            }),
          };
        }
        return mockCollection;
      });
      const res = mockRes();
      await billsController.getBills({}, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bills: expect.any(Array),
        })
      );
    });

    it("maneja errores correctamente", async () => {
      mockCollection.get.mockRejectedValue(new Error("Fallo DB"));
      const res = mockRes();
      await billsController.getBills({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createBill", () => {
    it("retorna 406 si faltan mesa o usuario", async () => {
      const req = { body: { products: [] } };
      const res = mockRes();
      await billsController.createBill(req, res);
      expect(res.status).toHaveBeenCalledWith(406);
    });

    it("crea la cuenta correctamente", async () => {
      mockCollection.add.mockResolvedValue({});
      mockCollection.where.mockReturnValue({
        limit: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              exists: true,
              docs: [{ id: "p1", stock: 10, data: () => ({ stock: 10 }) }],
            })
          ),
        })),
      });

      db.collection.mockImplementation((col) => {
        if (col === "products") return mockCollection;
        if (col === "bills") return mockCollection;
        return mockCollection;
      });

      const req = {
        body: {
          state: "open",
          total: 150,
          table: 5,
          user_id: "user123",
          products: [
            { id: "p1", name: "coca cola", units: 1, process: "in process" },
          ],
        },
      };
      const res = mockRes();

      await billsController.createBill(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("maneja errores en la creación", async () => {
      mockCollection.add.mockRejectedValue(new Error("Fallo DB"));
      const req = { body: { table: 5, user_id: "user123", products: [] } };
      const res = mockRes();
      await billsController.createBill(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getBillById", () => {
    it("retorna 404 si no se encuentra la cuenta", async () => {
      getResourceDoc.mockResolvedValueOnce(null);
      const req = { params: { id: "1" } };
      const res = mockRes();
      await billsController.getBillById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("retorna la cuenta con datos de usuario", async () => {
      getResourceDoc
        .mockResolvedValueOnce({
          state: "open",
          total: 100,
          table: 5,
          user_id: "u1",
          products: [],
        })
        .mockResolvedValueOnce({ data: () => ({ name: "Juan" }) });

      const req = { params: { id: "1" } };
      const res = mockRes();
      await billsController.getBillById(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" })
      );
    });
  });

  describe("addProductToBill", () => {
    const mockBillRef = {
      get: jest.fn(),
      update: jest.fn(),
    };

    beforeEach(() => {
      db.collection.mockImplementation((col) => {
        if (col === "bills") return { doc: () => mockBillRef };
        if (col === "products") return mockCollection;
        return mockCollection;
      });
    });

    it("retorna 406 si no se envían productos", async () => {
      const req = { params: { id: "1" }, body: {} };
      const res = mockRes();
      await billsController.addProductToBill(req, res);
      expect(res.status).toHaveBeenCalledWith(406);
    });

    it("retorna 404 si la cuenta no existe", async () => {
      mockBillRef.get.mockResolvedValue({ exists: false });
      const req = {
        params: { id: "1" },
        body: { products: [{ id: "p1", units: 1 }] },
      };
      const res = mockRes();
      await billsController.addProductToBill(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("agrega producto correctamente", async () => {
      mockBillRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ products: [{ id: "p1", units: 1 }] }),
      });
      mockBillRef.update.mockResolvedValue({});
      mockCollection.where.mockReturnValue({
        limit: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              exists: true,
              docs: [{ id: "p2", stock: 10, data: () => ({ stock: 10 }) }],
            })
          ),
        })),
      });

      const req = {
        params: { id: "1" },
        body: { products: [{ id: "p2", units: 1 }] },
      };
      const res = mockRes();

      await billsController.addProductToBill(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  db.collection.mockImplementation((col) => {
    if (col === "bills") return { doc: () => mockBillRef };
    if (col === "products") {
      return {
        where: jest.fn().mockReturnValue({
          limit: jest.fn(() => ({
            get: jest.fn(() =>
              Promise.resolve({
                empty: false,
                docs: [{ data: () => ({ price: 10 }) }],
              })
            ),
          })),
        }),
      };
    }
    return mockCollection;
  });

  describe("removeProductFromBill", () => {
    const mockBillRef = {
      get: jest.fn(),
      update: jest.fn(),
    };

    beforeEach(() => {
      db.collection.mockImplementation((col) => {
        if (col === "bills") {
          return { doc: () => mockBillRef };
        }
        if (col === "products") {
          return {
            where: jest.fn().mockReturnValue({
              limit: jest.fn(() => ({
                get: jest.fn(() =>
                  Promise.resolve({
                    empty: false,
                    docs: [{ data: () => ({ price: 10 }) }],
                  })
                ),
              })),
            }),
          };
        }
        return mockCollection;
      });
    });

    it("retorna 400 si falta productId", async () => {
      const req = { params: { id: "1" }, body: {} };
      const res = mockRes();
      await billsController.removeProductFromBill(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("elimina producto correctamente", async () => {
      mockBillRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ products: [{ id: "p1" }, { id: "p2" }] }),
      });
      const req = { params: { id: "1" }, body: { productId: "p1" } };
      const res = mockRes();
      await billsController.removeProductFromBill(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
