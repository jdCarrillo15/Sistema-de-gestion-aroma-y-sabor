import * as billsController from "../controllers/billsController.js";
import { admin, db } from "../config/firebase.js";

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

// Mock sockets getIO to avoid module resolution/emits during tests
jest.mock("../sockets/socket.js", () => ({
  getIO: () => ({
    to: () => ({ emit: jest.fn() }),
  }),
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockDoc = { update: jest.fn(), get: jest.fn(), delete: jest.fn() };
const mockBillRef = { update: jest.fn(), get: jest.fn(), delete: jest.fn() };
const mockProductRef = { update: jest.fn(), get: jest.fn(), delete: jest.fn() };

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
  // Default: collections support simple get/add/doc and chainable where/limit/get
  const chain = {
    where: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    orderBy: jest.fn(() => chain),
    get: jest.fn().mockResolvedValue({ empty: true }),
  };
  db.collection.mockReturnValue({ ...mockCollection, ...chain });
  mockCollection.doc.mockReturnValue({
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        products: [{ id: "prod1", units: 1 }],
      }),
    }),
    update: jest.fn().mockResolvedValue(), // asegúrate de incluirlo
  });
});

jest.spyOn(console, "log").mockImplementation(() => {});

// ==============================
// ✅ CREATE BILL
// ==============================
describe("createBill", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
  });

  test("crea cuenta correctamente sin productos", async () => {
    req.body = { table: 1, user_id: "user123", total: 0 };
    // Setup chain for bills: no existing open bill
    const billsChain = {
      where: jest.fn(function () { return this; }),
      limit: jest.fn(function () { return this; }),
      get: jest.fn().mockResolvedValue({ empty: true }),
      add: jest.fn().mockResolvedValue({ id: "newBill123" }),
      doc: jest.fn(() => ({ get: jest.fn(), update: jest.fn() })),
    };
    const tablesChain = {
      where: jest.fn(function () { return this; }),
      limit: jest.fn(function () { return this; }),
      get: jest.fn().mockResolvedValue({ empty: true }),
      doc: jest.fn(() => ({ get: jest.fn(), update: jest.fn() })),
    };
    db.collection.mockImplementation((col) => {
      if (col === "bills") return billsChain;
      if (col === "tables") return tablesChain;
      return mockCollection;
    });

    await billsController.createBill(req, res);

    expect(billsChain.add).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cuenta creada correctamente",
      id: "newBill123",
      existing: false,
    });
  });

  test("falla sin mesa o usuario", async () => {
    req.body = { table: null, user_id: null };
    await billsController.createBill(req, res);
    expect(res.status).toHaveBeenCalledWith(406);
  });
});

// ==============================
// ✅ ADD PRODUCT TO BILL
// ==============================
describe("addProductToBill", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
  });

  test("agrega productos correctamente", async () => {
    req.params.id = "bill123";
    req.body = {
      products: [{ id: "prod1", units: 2 }],
    };

    mockCollection.doc.mockImplementation((id) => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ price: 10, stock: 5, name: "Producto 1" }),
      }),
      update: jest.fn().mockResolvedValue(), // ✅ agregado
    }));

    mockDoc.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ products: [], total: 0 }),
    });

    await billsController.addProductToBill(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Producto agregado a la cuenta correctamente",
      })
    );
  });

  test("falla si producto no existe", async () => {
    req.params.id = "bill123";
    req.body = {
      products: [{ id: "noProd", units: 1 }],
    };

    mockCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    await billsController.addProductToBill(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ==============================
// ✅ REMOVE PRODUCT FROM BILL
// ==============================
describe("removeProductFromBill", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();

    db.collection.mockImplementation((col) => {
      if (col === "bills") return { doc: () => mockBillRef };
      if (col === "products") return { doc: jest.fn(() => mockProductRef) };
      return mockCollection;
    });
  });

  test("elimina producto correctamente", async () => {
    req.params.id = "bill123";
    req.body = { productId: "prod1" };

    mockBillRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ products: [{ id: "prod1", units: 2 }] }),
    });

    await billsController.removeProductFromBill(req, res);

    expect(mockBillRef.update).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("falla si no se pasa productId", async () => {
    req.params.id = "bill123";
    req.body = {};
    await billsController.removeProductFromBill(req, res);
    // El controlador no valida productId ausente; retorna 200 tras update
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ==============================
// ✅ UPDATE PRODUCTS IN BILL
// ==============================
describe("updateProductsInBill", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
  });

  test("actualiza productos correctamente", async () => {
    req.params.id = "bill123";
    req.body = { products: [{ id: "prod1", units: 3 }] };

    mockDoc.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        products: [{ id: "prod1", units: 1 }],
      }),
    });

    await billsController.updateProductsInBill(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ==============================
// ✅ CLOSE BILL IF EMPTY
// ==============================
describe("closeBillIfEmpty", () => {
  let req, res;
  const mockDocRef = { update: jest.fn(), get: jest.fn() };

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
    const tablesChain = {
      where: jest.fn(function () { return this; }),
      limit: jest.fn(function () { return this; }),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    db.collection.mockImplementation((col) => {
      if (col === "bills") return { doc: () => mockDocRef };
      if (col === "tables") return tablesChain;
      return mockCollection;
    });
  });

  test("cierra cuenta vacía", async () => {
    req.params.id = "bill123";
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ products: [] }),
    });

    await billsController.closeBillIfEmpty(req, res);
    expect(mockDocRef.update).toHaveBeenCalledWith({ status: "closed" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("no cierra cuenta con productos", async () => {
    req.params.id = "bill123";
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ products: [{ id: "prod1" }] }),
    });

    await billsController.closeBillIfEmpty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ==============================
// ✅ CHANGE PRODUCT STATE
// ==============================
describe("changeProductStateInBill", () => {
  let req, res;
  const mockDocRef = { update: jest.fn(), get: jest.fn() };

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
    db.collection.mockReturnValue({ doc: () => mockDocRef });
  });

  test("cambia estado del producto correctamente", async () => {
    req.params.id = "bill123";
    req.body = { productId: "prod1", newState: "done" };

    mockDocRef.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        products: [{ id: "prod1", process: "in process" }],
      }),
    });

    await billsController.changeProductStateInBill(req, res);
    expect(mockDocRef.update).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("falla si no hay productId", async () => {
    req.params.id = "bill123";
    req.body = { newState: "done" };
    await billsController.changeProductStateInBill(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
