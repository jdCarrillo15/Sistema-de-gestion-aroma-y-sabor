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
      // Primer llamado: usuario
      resourceService.getResourceDoc.mockResolvedValue({
        exists: true,
        id: "u1",
        data: () => ({ nombre: "Juan" }),
      });

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

  describe("getBillById", () => {
    beforeEach(() => {
      resourceService.getResourceDoc.mockReset();
    });

    it("debe retornar 404 si la cuenta no existe", async () => {
      resourceService.getResourceDoc.mockResolvedValue(null);
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.getBillById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cuenta no encontrada" })
      );
    });

    it("debe retornar la cuenta si existe", async () => {
      // Primer llamado: bill, Segundo llamado: usuario
      resourceService.getResourceDoc
        .mockResolvedValueOnce({
          id: "1",
          state: "pagado",
          total: 100,
          table: 1,
          user_id: "u1",
          products: [],
          exists: true,
        })
        .mockResolvedValueOnce({
          exists: true,
          id: "u1",
          data: () => ({ nombre: "Juan" }),
        });

      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.getBillById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "pagado",
          total: 100,
          table: 1,
          user: { id: "u1", nombre: "Juan" },
          products: [],
          id: "1",
          created_at: "timestamp", // Si tu controller retorna un timestamp fijo
        })
      );
    });

    it("debe manejar errores", async () => {
      resourceService.getResourceDoc.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.getBillById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("updateBillById", () => {
    const mockDoc = {
      get: jest.fn(),
      update: jest.fn(),
      exists: true,
    };

    beforeEach(() => {
      mockCollection.doc.mockReturnValue(mockDoc);
      mockDoc.get.mockResolvedValue({ exists: true });
      mockDoc.update.mockResolvedValue({});
    });

    it("debe retornar 404 si la cuenta no existe", async () => {
      mockDoc.get.mockResolvedValue({ exists: false });
      const req = { params: { id: "1" }, body: {} };
      const res = mockRes();

      await billsController.updateBillById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cuenta no encontrada" })
      );
    });

    it("debe actualizar la cuenta y retornar 200", async () => {
      mockDoc.get.mockResolvedValue({ exists: true });
      const req = { params: { id: "1" }, body: { state: "pagado" } };
      const res = mockRes();

      await billsController.updateBillById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Cuenta actualizada correctamente" })
      );
    });

    it("debe manejar errores", async () => {
      mockDoc.get.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "1" }, body: {} };
      const res = mockRes();

      await billsController.updateBillById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("hardDeleteBill", () => {
    const mockBillRef = {
      get: jest.fn(),
      delete: jest.fn(),
    };

    beforeEach(() => {
      mockCollection.doc.mockReturnValue(mockBillRef);
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({}) });
      mockBillRef.delete.mockResolvedValue({});
    });

    it("debe retornar 400 si falta el id", async () => {
      const req = { params: {} };
      const res = mockRes();

      await billsController.hardDeleteBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Se requiere el ID de la cuenta" })
      );
    });

    it("debe retornar 404 si la cuenta no existe", async () => {
      mockBillRef.get.mockResolvedValue({ exists: false });
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.hardDeleteBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cuenta no encontrado" })
      );
    });

    it("debe eliminar la cuenta y retornar 200", async () => {
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({}) });
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.hardDeleteBill(req, res);

      expect(mockBillRef.delete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Cuenta y datos relacionados eliminados correctamente" })
      );
    });

    it("debe manejar errores", async () => {
      mockBillRef.get.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.hardDeleteBill(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("addProductToBill", () => {
    const mockBillRef = {
      get: jest.fn(),
      update: jest.fn(),
    };

    beforeEach(() => {
      mockCollection.doc.mockReturnValue(mockBillRef);
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({ products: [{ id: "p1" }] }) });
      mockBillRef.update.mockResolvedValue({});
    });

    it("debe retornar 400 si no se envía producto", async () => {
      const req = { params: { id: "1" }, body: {} };
      const res = mockRes();

      await billsController.addProductToBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Se requiere el producto a agregar" })
      );
    });

    it("debe retornar 404 si la cuenta no existe", async () => {
      mockBillRef.get.mockResolvedValue({ exists: false });
      const req = { params: { id: "1" }, body: { product: { id: "p2" } } };
      const res = mockRes();

      await billsController.addProductToBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cuenta no encontrada" })
      );
    });

    it("debe agregar el producto correctamente", async () => {
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({ products: [{ id: "p1" }] }) });
      const req = { params: { id: "1" }, body: { product: { id: "p2" } } };
      const res = mockRes();

      await billsController.addProductToBill(req, res);

      expect(mockBillRef.update).toHaveBeenCalledWith({ products: [{ id: "p1" }, { id: "p2" }] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Producto agregado a la cuenta correctamente" })
      );
    });

    it("debe manejar errores", async () => {
      mockBillRef.get.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "1" }, body: { product: { id: "p2" } } };
      const res = mockRes();

      await billsController.addProductToBill(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("removeProductFromBill", () => {
    const mockBillRef = {
      get: jest.fn(),
      update: jest.fn(),
    };

    beforeEach(() => {
      mockCollection.doc.mockReturnValue(mockBillRef);
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({ products: [{ id: "p1" }, { id: "p2" }] }) });
      mockBillRef.update.mockResolvedValue({});
    });

    it("debe retornar 400 si no se envía productId", async () => {
      const req = { params: { id: "1" }, body: {} };
      const res = mockRes();

      await billsController.removeProductFromBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Se requiere el ID del producto a eliminar" })
      );
    });

    it("debe retornar 404 si la cuenta no existe", async () => {
      mockBillRef.get.mockResolvedValue({ exists: false });
      const req = { params: { id: "1" }, body: { productId: "p2" } };
      const res = mockRes();

      await billsController.removeProductFromBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cuenta no encontrada" })
      );
    });

    it("debe eliminar el producto correctamente", async () => {
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({ products: [{ id: "p1" }, { id: "p2" }] }) });
      const req = { params: { id: "1" }, body: { productId: "p2" } };
      const res = mockRes();

      await billsController.removeProductFromBill(req, res);

      expect(mockBillRef.update).toHaveBeenCalledWith({ products: [{ id: "p1" }] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Producto eliminado de la cuenta correctamente" })
      );
    });

    it("debe manejar errores", async () => {
      mockBillRef.get.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "1" }, body: { productId: "p2" } };
      const res = mockRes();

      await billsController.removeProductFromBill(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("closeBillIfEmpty", () => {
    const mockBillRef = {
      get: jest.fn(),
      update: jest.fn(),
    };

    beforeEach(() => {
      mockCollection.doc.mockReturnValue(mockBillRef);
      mockBillRef.update.mockResolvedValue({});
    });

    it("debe retornar 404 si la cuenta no existe", async () => {
      mockBillRef.get.mockResolvedValue({ exists: false });
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.closeBillIfEmpty(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cuenta no encontrada" })
      );
    });

    it("debe cerrar la cuenta si no tiene productos", async () => {
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({ products: [] }) });
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.closeBillIfEmpty(req, res);

      expect(mockBillRef.update).toHaveBeenCalledWith({ state: "closed" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Cuenta cerrada correctamente" })
      );
    });

    it("debe retornar error si la cuenta tiene productos", async () => {
      mockBillRef.get.mockResolvedValue({ exists: true, data: () => ({ products: [{ id: "p1" }] }) });
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.closeBillIfEmpty(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "La cuenta no está vacía, no se puede cerrar" })
      );
    });

    it("debe manejar errores", async () => {
      mockBillRef.get.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "1" } };
      const res = mockRes();

      await billsController.closeBillIfEmpty(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });
});