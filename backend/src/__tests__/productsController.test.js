// 1. Define los mocks primero
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

// 2. Mockea los módulos DESPUÉS de definir los mocks
jest.mock("../config/firebase.js", () => ({
    db: mockDb,
    admin: mockAdmin,
}));

jest.mock("../services/resourceService.js", () => ({
    getResourceDoc: jest.fn(),
}));

// 3. Usa require en vez de import para los módulos que dependen de los mocks
const { describe, it, expect, afterEach, beforeEach, jest: jestGlobals } = require('@jest/globals');
const productsController = require("../controllers/productsController.js").default || require("../controllers/productsController.js");
const resourceService = require("../services/resourceService.js");

// Mock Express req/res
function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("productsController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getProducts", () => {
        it("should return empty products array if no products", async () => {
            mockCollection.get.mockResolvedValue({ empty: true });
            const req = {};
            const res = mockRes();

            await productsController.getProducts(req, res);

            expect(res.json).toHaveBeenCalledWith({ products: [] });
        });

        it("should return products array if products exist", async () => {
            mockCollection.get.mockResolvedValue({
                empty: false,
                docs: [
                    {
                        id: "1",
                        data: () => ({
                            name: "Café",
                            price: 10,
                            status: "active",
                            stock: 5,
                            type: "prepared",
                        }),
                    },
                ],
            });
            const req = {};
            const res = mockRes();

            await productsController.getProducts(req, res);

            expect(res.json).toHaveBeenCalledWith({
                products: [
                    {
                        id: "1",
                        name: "Café",
                        price: 10,
                        status: "active",
                        stock: 5,
                        type: "prepared",
                    },
                ],
            });
        });

        it("should handle errors", async () => {
            mockCollection.get.mockRejectedValue(new Error("fail"));
            const req = {};
            const res = mockRes();

            await productsController.getProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
        });

        it("should handle multiple products", async () => {
            mockCollection.get.mockResolvedValue({
                empty: false,
                docs: [
                    {
                        id: "1",
                        data: () => ({
                            name: "Café",
                            price: 10,
                            status: "active",
                            stock: 5,
                            type: "prepared",
                        }),
                    },
                    {
                        id: "2",
                        data: () => ({
                            name: "Té",
                            price: 7,
                            status: "inactive",
                            stock: 2,
                            type: "nonprepared",
                        }),
                    },
                ],
            });
            const req = {};
            const res = mockRes();

            await productsController.getProducts(req, res);

            expect(res.json).toHaveBeenCalledWith({
                products: [
                    {
                        id: "1",
                        name: "Café",
                        price: 10,
                        status: "active",
                        stock: 5,
                        type: "prepared",
                    },
                    {
                        id: "2",
                        name: "Té",
                        price: 7,
                        status: "inactive",
                        stock: 2,
                        type: "nonprepared",
                    },
                ],
            });
        });
    });

    describe("createProduct", () => {
        it("should return 406 if name or price missing", async () => {
            const req = { body: { name: "" } };
            const res = mockRes();

            await productsController.createProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(406);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Name y price son obligatorios" })
            );
        });

        it("should create product and return 201", async () => {
            mockCollection.add.mockResolvedValue({});
            const req = {
                body: {
                    name: "Té",
                    price: 5,
                    status: "active",
                    stock: 10,
                    type: "",
                },
            };
            const res = mockRes();

            await productsController.createProduct(req, res);

            expect(mockCollection.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Té",
                    price: 5,
                    status: "active",
                    stock: 10,
                    type: "nonprepared",
                    created_at: "timestamp",
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Producto creado correctamente" })
            );
        });

        it("should use provided type if not empty", async () => {
            mockCollection.add.mockResolvedValue({});
            const req = {
                body: {
                    name: "Mate",
                    price: 3,
                    status: "active",
                    stock: 8,
                    type: "prepared",
                },
            };
            const res = mockRes();

            await productsController.createProduct(req, res);

            expect(mockCollection.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Mate",
                    price: 3,
                    status: "active",
                    stock: 8,
                    type: "prepared",
                    created_at: "timestamp",
                })
            );
        });

        it("should handle errors", async () => {
            mockCollection.add.mockRejectedValue(new Error("fail"));
            const req = {
                body: { name: "Té", price: 5, status: "active", stock: 10, type: "" },
            };
            const res = mockRes();

            await productsController.createProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Error al crear el producto" })
            );
        });
    });

    describe("getProductById", () => {
        beforeEach(() => {
            resourceService.getResourceDoc.mockReset();
        });

        it("should return 404 if product not found", async () => {
            resourceService.getResourceDoc.mockResolvedValue(null);
            const req = { params: { id: "1" } };
            const res = mockRes();

            await productsController.getProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Producto no encontrado" })
            );
        });

        it("should return product if found", async () => {
            resourceService.getResourceDoc.mockResolvedValue({
                id: "1",
                name: "Café",
                price: 10,
                status: "active",
                stock: 5,
                type: "prepared",
            });
            const req = { params: { id: "1" } };
            const res = mockRes();

            await productsController.getProductById(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "1",
                    name: "Café",
                    price: 10,
                    status: "active",
                    stock: 5,
                    type: "prepared",
                    created_at: "timestamp",
                })
            );
        });

        it("should handle errors", async () => {
            resourceService.getResourceDoc.mockRejectedValue(new Error("fail"));
            const req = { params: { id: "1" } };
            const res = mockRes();

            await productsController.getProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Error obteniendo producto" })
            );
        });

        it("should call getResourceDoc with correct params", async () => {
            const spy = jest.spyOn(resourceService, "getResourceDoc");
            spy.mockResolvedValue(null);
            const req = { params: { id: "abc" } };
            const res = mockRes();

            await productsController.getProductById(req, res);

            expect(spy).toHaveBeenCalledWith("abc", "products");
        });
    });

    describe("updateProductById", () => {
        const mockDoc = {
            get: jest.fn(),
            update: jest.fn(),
        };

        beforeEach(() => {
            mockCollection.doc.mockReturnValue(mockDoc);
        });

        it("should return 404 if product not found", async () => {
            mockDoc.get.mockResolvedValue({ exists: false });
            const req = { params: { id: "1" }, body: {} };
            const res = mockRes();

            await productsController.updateProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
        });

        it("should update product and return 200", async () => {
            mockDoc.get.mockResolvedValue({ exists: true });
            mockDoc.update.mockResolvedValue({});
            const req = { params: { id: "1" }, body: { name: "Nuevo" } };
            const res = mockRes();

            await productsController.updateProductById(req, res);

            expect(mockDoc.update).toHaveBeenCalledWith({ name: "Nuevo" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            );
        });

        it("should handle errors", async () => {
            mockDoc.get.mockRejectedValue(new Error("fail"));
            const req = { params: { id: "1" }, body: {} };
            const res = mockRes();

            await productsController.updateProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
        });

        it("should call update with the correct data", async () => {
            mockDoc.get.mockResolvedValue({ exists: true });
            mockDoc.update.mockResolvedValue({});
            const req = { params: { id: "1" }, body: { price: 99, stock: 2 } };
            const res = mockRes();

            await productsController.updateProductById(req, res);

            expect(mockDoc.update).toHaveBeenCalledWith({ price: 99, stock: 2 });
        });
    });

    describe("hardDeleteProduct", () => {
        const mockProductRef = {
            get: jest.fn(),
            delete: jest.fn(),
        };

        beforeEach(() => {
            mockCollection.doc.mockReturnValue(mockProductRef);
        });

        it("should return 400 if id is missing", async () => {
            const req = { params: {} };
            const res = mockRes();

            await productsController.hardDeleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Se requiere el ID del producto" })
            );
        });

        it("should return 404 if product not found", async () => {
            mockProductRef.get.mockResolvedValue({ exists: false });
            const req = { params: { id: "1" } };
            const res = mockRes();

            await productsController.hardDeleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Producto no encontrado" })
            );
        });

        it("should delete product and return 200", async () => {
            mockProductRef.get.mockResolvedValue({
                exists: true,
                data: () => ({}),
            });
            mockProductRef.delete.mockResolvedValue({});
            const req = { params: { id: "1" } };
            const res = mockRes();

            await productsController.hardDeleteProduct(req, res);

            expect(mockProductRef.delete).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Producto y datos relacionados eliminados correctamente" })
            );
        });

        it("should handle errors", async () => {
            mockProductRef.get.mockRejectedValue(new Error("fail"));
            const req = { params: { id: "1" } };
            const res = mockRes();

            await productsController.hardDeleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: "Error al eliminar producto" })
            );
        });

        it("should not call delete if product does not exist", async () => {
            mockProductRef.get.mockResolvedValue({ exists: false });
            const req = { params: { id: "2" } };
            const res = mockRes();

            await productsController.hardDeleteProduct(req, res);

            expect(mockProductRef.delete).not.toHaveBeenCalled();
        });
    });
});
