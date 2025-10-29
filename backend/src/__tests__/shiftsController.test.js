// Mocks base
const mockDocRef = () => ({
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeChain = (overrides = {}) => {
  const chain = {
    where: jest.fn(() => chain),
    orderBy: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    doc: jest.fn(() => mockDocRef()),
    add: jest.fn(async () => ({ id: "newShift123" })),
    ...overrides,
  };
  return chain;
};

const mockDb = {
  collection: jest.fn(() => makeChain()),
};

const mockAdmin = {
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => "timestamp"),
    },
    Timestamp: {
      fromDate: jest.fn((d) => ({ seconds: Math.floor(d.getTime() / 1000) })),
    },
  },
};

jest.mock("../config/firebase.js", () => ({
  db: mockDb,
  admin: mockAdmin,
}));

jest.mock("../sockets/socket.js", () => ({
  getIO: () => ({ to: () => ({ emit: jest.fn() }) }),
}));

// Carga del controller con require para respetar mocks
const shiftsController = require("../controllers/shiftsController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.collection.mockImplementation(() => makeChain());
});

describe("shiftsController.createShift", () => {
  test("retorna 406 si falta user_id", async () => {
    const req = { body: {} };
    const res = mockRes();

    await shiftsController.createShift(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
  });

  test("crea un turno y retorna 201", async () => {
    const req = { body: { user_id: "user1" } };
    const res = mockRes();

    const shiftsCol = makeChain({ add: jest.fn(async () => ({ id: "s1" })) });
    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return shiftsCol;
      return makeChain();
    });

    await shiftsController.createShift(req, res);

    expect(shiftsCol.add).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: "s1" })
    );
  });
});

describe("shiftsController.getShifts", () => {
  test("retorna vacío si no hay turnos", async () => {
    const req = {};
    const res = mockRes();

    const shiftsCol = makeChain({ get: jest.fn().mockResolvedValue({ empty: true, docs: [] }) });
    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return shiftsCol;
      return makeChain();
    });

    await shiftsController.getShifts(req, res);
    expect(res.json).toHaveBeenCalledWith({ shifts: [] });
  });

  test("retorna turnos con agregaciones", async () => {
    const req = {};
    const res = mockRes();

    const shiftDoc = {
      id: "s1",
      data: () => ({ user_id: "u1", state: "open", started_at: "t1", finished_at: null }),
    };

    const shiftsCol = makeChain({
      orderBy: jest.fn(() => shiftsCol),
      get: jest.fn().mockResolvedValue({ empty: false, docs: [shiftDoc] }),
    });

    const billsCol = makeChain({
      where: jest.fn(() => billsCol),
      get: jest.fn().mockResolvedValue({
        empty: false,
        size: 1,
        docs: [
          {
            data: () => ({ total: 100, products: [{ id: "p1", name: "Cafe", units: 2 }] }),
          },
        ],
      }),
    });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return shiftsCol;
      if (col === "bills") return billsCol;
      return makeChain();
    });

    await shiftsController.getShifts(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ shifts: expect.any(Array) })
    );
    const payload = res.json.mock.calls[0][0];
    expect(payload.shifts[0]).toEqual(
      expect.objectContaining({ total_bills: 1, total_sales: 100 })
    );
  });
});

describe("shiftsController.getShiftById", () => {
  test("404 si turno no existe", async () => {
    const req = { params: { id: "s1" } };
    const res = mockRes();

    const doc = mockDocRef();
    doc.get.mockResolvedValue({ exists: false });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return { doc: () => doc };
      return makeChain();
    });

    await shiftsController.getShiftById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("retorna turno con agregados", async () => {
    const req = { params: { id: "s1" } };
    const res = mockRes();

    const doc = mockDocRef();
    doc.get.mockResolvedValue({ exists: true, data: () => ({ user_id: "u1", state: "open" }) });

    const billsCol = makeChain({
      where: jest.fn(() => billsCol),
      get: jest.fn().mockResolvedValue({
        empty: false,
        size: 2,
        docs: [
          { data: () => ({ total: 100, products: [{ id: "p1", name: "Cafe", units: 1 }] }) },
          { data: () => ({ total: 50, products: [{ id: "p2", name: "Te", units: 3 }] }) },
        ],
      }),
    });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return { doc: () => doc };
      if (col === "bills") return billsCol;
      return makeChain();
    });

    await shiftsController.getShiftById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total_bills: 2, total_sales: 150 })
    );
  });
});

describe("shiftsController.updateShiftById", () => {
  test("404 si turno no existe", async () => {
    const req = { params: { id: "s1" }, body: {} };
    const res = mockRes();

    const doc = mockDocRef();
    doc.get.mockResolvedValue({ exists: false });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return { doc: () => doc };
      return makeChain();
    });

    await shiftsController.updateShiftById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("actualiza y retorna 200", async () => {
    const req = { params: { id: "s1" }, body: { state: "closed" } };
    const res = mockRes();

    const doc = mockDocRef();
    doc.get.mockResolvedValue({ exists: true });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return { doc: () => doc };
      return makeChain();
    });

    await shiftsController.updateShiftById(req, res);

    expect(doc.update).toHaveBeenCalledWith(expect.objectContaining({ state: "closed" }));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("shiftsController.deleteShift", () => {
  test("400 si falta id", async () => {
    const req = { params: {} };
    const res = mockRes();

    await shiftsController.deleteShift(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 si existen cuentas asociadas", async () => {
    const req = { params: { id: "s1" } };
    const res = mockRes();

    const billsCol = makeChain({
      where: jest.fn(() => billsCol),
      limit: jest.fn(() => billsCol),
      get: jest.fn().mockResolvedValue({ empty: false }),
    });

    mockDb.collection.mockImplementation((col) => {
      if (col === "bills") return billsCol;
      return makeChain();
    });

    await shiftsController.deleteShift(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("elimina y retorna 200 si no hay cuentas", async () => {
    const req = { params: { id: "s1" } };
    const res = mockRes();

    const billsCol = makeChain({
      where: jest.fn(() => billsCol),
      limit: jest.fn(() => billsCol),
      get: jest.fn().mockResolvedValue({ empty: true }),
    });

    const shiftsCol = makeChain({
      doc: jest.fn(() => ({ delete: jest.fn() })),
    });

    mockDb.collection.mockImplementation((col) => {
      if (col === "bills") return billsCol;
      if (col === "shifts") return shiftsCol;
      return makeChain();
    });

    await shiftsController.deleteShift(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("shiftsController.getShiftAggregate", () => {
  test("404 si turno no existe", async () => {
    const req = { params: { id: "s1" } };
    const res = mockRes();

    const doc = mockDocRef();
    doc.get.mockResolvedValue({ exists: false });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return { doc: () => doc };
      return makeChain();
    });

    await shiftsController.getShiftAggregate(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("retorna agregación del turno", async () => {
    const req = { params: { id: "s1" } };
    const res = mockRes();

    const doc = mockDocRef();
    doc.get.mockResolvedValue({ exists: true, data: () => ({}) });

    const billsCol = makeChain({
      where: jest.fn(() => billsCol),
      get: jest.fn().mockResolvedValue({
        empty: false,
        size: 1,
        docs: [
          { data: () => ({ total: 200, products: [{ id: "p1", name: "Cafe", units: 2 }] }) },
        ],
      }),
    });

    mockDb.collection.mockImplementation((col) => {
      if (col === "shifts") return { doc: () => doc };
      if (col === "bills") return billsCol;
      return makeChain();
    });

    await shiftsController.getShiftAggregate(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: "s1", total_bills: 1, total_sales: 200 })
    );
  });
});
